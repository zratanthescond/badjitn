'use server'

import { v4 as uuidv4 } from 'uuid'
import { connectToDatabase } from '../database'
import BankTransfer from '../database/models/banktransfer.model'
import Order from '../database/models/order.model'
import Event from '../database/models/event.model'
import User from '../database/models/user.model'

interface BankTransferInput {
  eventId: string
  buyerId: string
  totalAmount: string
  details: any[]
  requiredUserInfo?: any[]
  discountInfo?: any
  transferId: string | null
  screenshotUrl: string | null
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
      transferId,
      screenshotUrl
    } = input

    // Basic validation
    if (!eventId || !buyerId || !totalAmount) {
      return {
        success: false,
        message: 'Missing required order information',
      }
    }

    // Validate that at least one submission method is provided
    if (!transferId && !screenshotUrl) {
      return {
        success: false,
        message: 'Please provide either a transfer ID or a screenshot',
      }
    }

    await connectToDatabase()

    // 1. Find the buyer to get their MongoDB ID
    // Try by clerkId first (most common), fallback to _id if it's a valid ObjectId string
    let buyer = await User.findOne({ clerkId: buyerId })

    if (!buyer && buyerId.match(/^[0-9a-fA-F]{24}$/)) {
      buyer = await User.findById(buyerId)
    }

    if (!buyer) {
      console.error(`[Bank Transfer] Buyer not found for ID: ${buyerId}`)
      return {
        success: false,
        message: `Buyer not found (ID: ${buyerId}). Please ensure your profile is fully set up.`,
      }
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
      buyer: buyer._id,
      totalAmount: Number(totalAmount),
      type: 'bank_transfer',
      details: details || [],
      requiredUserInfo: requiredUserInfo || [],
      discountInfo: discountInfo || null,
    })

    if (!newOrder) {
      throw new Error('Failed to create order')
    }

    // 4. Create bank transfer record linked to the new order
    const bankTransfer = await BankTransfer.create({
      orderId: newOrder._id.toString(),
      transferId: transferId || null,
      screenshotUrl: screenshotUrl || null,
      status: 'pending',
      amount: Number(totalAmount),
      buyerName: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.username,
      eventTitle: event.title,
    })

    console.log('[Bank Transfer] Order and Transfer created:', {
      orderId: newOrder._id,
      transferId: bankTransfer._id,
      status: 'pending',
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
