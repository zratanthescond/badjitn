'use server'

import { v4 as uuidv4 } from 'uuid'
import { connectToDatabase } from '../database'
import BankTransfer from '../database/models/banktransfer.model'
import Order from '../database/models/order.model'
import Event from '../database/models/event.model'
import User from '../database/models/user.model'
import { sendRegistrationStatusEmail } from './order.actions'
import { uploadToFileServer } from '../upload-to-server'
import path from 'path'

interface BankTransferInput {
  eventId: string
  buyerId?: string
  totalAmount: string
  details: any[]
  requiredUserInfo?: any[]
  discountInfo?: any
  discountProofUrl?: string | null
  originalAmount?: number | string
  transferId: string | null
  screenshotBase64?: string | null
  screenshotUrl?: string | null
}

interface BankTransferResponse {
  success: boolean
  message?: string
  paymentId?: string
}

export async function submitBankTransfer(input: BankTransferInput): Promise<BankTransferResponse> {
  try {
    const {
      eventId,
      buyerId,
      totalAmount,
      details,
      requiredUserInfo,
      discountInfo,
      discountProofUrl,
      originalAmount,
      transferId,
      screenshotBase64,
      screenshotUrl: inputScreenshotUrl
    } = input

    // Basic validation
    if (!eventId || !totalAmount) {
      return {
        success: false,
        message: 'Missing required order information',
      }
    }

    // Validate that at least one submission method is provided
    if (!transferId && !screenshotBase64 && !inputScreenshotUrl) {
      return {
        success: false,
        message: 'Please provide either a transfer ID or a screenshot',
      }
    }

    // Save screenshot file if base64 is provided and no URL is given
    let screenshotUrl: string | null = inputScreenshotUrl || null
    if (!screenshotUrl && screenshotBase64) {
      try {
        // Extract the mime type and base64 data
        const matches = screenshotBase64.match(/^data:image\/(\w+);base64,(.+)$/)
        if (!matches) {
          return {
            success: false,
            message: 'Invalid image format',
          }
        }
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // Generate unique filename and save to file server
        const filename = `bank-transfer-${Date.now()}-${uuidv4().slice(0, 8)}.${ext}`
        screenshotUrl = await uploadToFileServer(buffer, filename, `image/${ext}`)
      } catch (fileError) {
        console.error('[Bank Transfer] Error saving screenshot:', fileError)
        return {
          success: false,
          message: 'Failed to save screenshot. Please try again.',
        }
      }
    }

    await connectToDatabase()

    // 1. Find the buyer to get their MongoDB ID
    // Try by clerkId first (most common), fallback to _id if it's a valid ObjectId string
    let buyer = buyerId ? await User.findOne({ clerkId: buyerId }) : null

    if (!buyer && buyerId && buyerId.match(/^[0-9a-fA-F]{24}$/)) {
      buyer = await User.findById(buyerId)
    }

    // 2. Find the event to get its title
    const event = await Event.findById(eventId)
    if (!event) {
      return {
        success: false,
        message: 'Event not found',
      }
    }

    // 3. Create the Order first
    const newOrder = await Order.create({
      stripeId: `bt_${uuidv4()}`,
      event: eventId,
      ...(buyer ? { buyer: buyer._id } : {}),
      totalAmount: Number(totalAmount),
      type: 'bank_transfer',
      details: details || [],
      requiredUserInfo: requiredUserInfo || [],
      discountInfo: discountInfo || null,
      ...(discountProofUrl ? { discountProofUrl } : {}),
      ...(originalAmount !== undefined ? { originalAmount: Number(originalAmount) } : {}),
    })

    if (!newOrder) {
      throw new Error('Failed to create order')
    }

    // 4. Create bank transfer record linked to the new order
    const guestName =
      requiredUserInfo?.find((item: any) => item.field === "firstName")?.value ||
      requiredUserInfo?.find((item: any) => item.label?.toLowerCase() === "first name")?.value ||
      "";
    const guestLastName =
      requiredUserInfo?.find((item: any) => item.field === "lastName")?.value ||
      requiredUserInfo?.find((item: any) => item.label?.toLowerCase() === "last name")?.value ||
      "";
    const derivedBuyerName =
      `${guestName} ${guestLastName}`.trim() ||
      buyer?.firstName ||
      buyer?.username ||
      "Guest attendee";

    const bankTransfer = await BankTransfer.create({
      orderId: newOrder._id.toString(),
      eventId: eventId,
      transferId: transferId || null,
      screenshotUrl: screenshotUrl || null,
      status: 'pending',
      amount: Number(totalAmount),
      buyerName: buyer
        ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.username
        : derivedBuyerName,
      eventTitle: event.title,
    })

    console.log('[Bank Transfer] Order and Transfer created:', {
      orderId: newOrder._id,
      transferId: bankTransfer._id,
      status: 'pending',
    })

    // Confirmation email with chosen plans + status (best-effort)
    await sendRegistrationStatusEmail({
      eventTitle: event.title,
      country: event.country,
      location: event.location,
      requiredUserInfo: requiredUserInfo || [],
      details: details || [],
      totalAmount: Number(totalAmount),
      type: 'bank_transfer',
    })

    return {
      success: true,
      message: 'Bank transfer submitted successfully. Please wait for verification.',
      paymentId: bankTransfer._id.toString(),
    }
  } catch (error) {
    console.error('[Bank Transfer] Error submitting:', error)
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}
