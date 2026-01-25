'use server'

interface BankTransferInput {
  orderId: string
  transferId: string | null
  screenshot: FormData | null
}

interface BankTransferResponse {
  success: boolean
  message?: string
  paymentId?: string
}

export async function submitBankTransfer(input: BankTransferInput): Promise<BankTransferResponse> {
  try {
    const { orderId, transferId, screenshot } = input

    // Validate orderId
    if (!orderId || typeof orderId !== 'string') {
      return {
        success: false,
        message: 'Invalid order ID',
      }
    }

    // Validate that at least one submission method is provided
    if (!transferId && !screenshot) {
      return {
        success: false,
        message: 'Please provide either a transfer ID or a screenshot',
      }
    }

    let screenshotUrl: string | null = null

    // Handle screenshot upload if provided
    if (screenshot) {
      const file = screenshot.get('file') as File
      
      if (!file) {
        return {
          success: false,
          message: 'No file provided',
        }
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'File must be an image',
        }
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: 'File size must be less than 5MB',
        }
      }

      // TODO: Upload to Vercel Blob Storage or your preferred storage
      // For now, we'll store the filename and size
      screenshotUrl = `${file.name}`
    }

    // TODO: Store bank transfer record in database
    // This is where you would:
    // 1. Create a new bank_transfer record with:
    //    - orderId
    //    - transferId (if provided)
    //    - screenshotUrl (if provided)
    //    - status: 'pending' (awaiting admin verification)
    //    - createdAt: current timestamp
    //
    // Example structure:
    // await db.bankTransfer.create({
    //   orderId,
    //   transferId: transferId || null,
    //   screenshotUrl: screenshotUrl || null,
    //   status: 'pending',
    //   createdAt: new Date(),
    // })

    console.log('[v0] Bank transfer submitted:', {
      orderId,
      transferId,
      hasScreenshot: !!screenshotUrl,
      screenshotUrl,
    })

    return {
      success: true,
      message: 'Bank transfer submitted successfully. Please wait for verification.',
      paymentId: `BT-${orderId}-${Date.now()}`,
    }
  } catch (error) {
    console.error('[v0] Error submitting bank transfer:', error)
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}
