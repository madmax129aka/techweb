/**
 * Payment routes (Razorpay integration)
 * 
 * POST /api/payment/create-order - Create Razorpay order
 * POST /api/payment/verify - Verify payment signature and auto-approve registration
 * GET /api/payment/config - Get Razorpay key ID for frontend
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Razorpay SDK
const Razorpay = require('razorpay');

/**
 * GET /api/payment/config
 * Returns Razorpay Key ID for frontend (safe to expose)
 */
router.get('/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  
  if (!keyId) {
    return res.status(500).json({
      error: 'Razorpay not configured. Please set RAZORPAY_KEY_ID in environment variables.'
    });
  }

  res.json({ keyId });
});

/**
 * POST /api/payment/create-order
 * Create a Razorpay order for checkout
 * 
 * Body: { amount: number (in rupees), registrationId: string }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, registrationId } = req.body;

    if (!amount || !registrationId) {
      return res.status(400).json({ error: 'Amount and registrationId are required' });
    }

    // Verify registration exists and is pending
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Registration is not in pending state',
        currentStatus: registration.status 
      });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise (1 rupee = 100 paise)
      currency: 'INR',
      receipt: registrationId,
      notes: {
        registrationId: registrationId
      }
    });

    // Store order ID in registration
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        razorpayOrderId: order.id,
        paymentMethod: 'razorpay'
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and auto-approve registration
 * 
 * Body: {
 *   razorpayOrderId: string,
 *   razorpayPaymentId: string,
 *   razorpaySignature: string,
 *   registrationId: string
 * }
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      registrationId
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !registrationId) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    // CRITICAL SECURITY: Verify signature server-side
    // Never trust frontend claims without signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      return res.status(500).json({ error: 'Razorpay secret key not configured' });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (!isSignatureValid) {
      // Log suspicious activity
      console.error('Payment signature verification failed:', {
        registrationId,
        razorpayOrderId,
        razorpayPaymentId
      });

      return res.status(400).json({ 
        error: 'Payment verification failed. Invalid signature.',
        verified: false
      });
    }

    // Signature verified - payment is genuine
    // Auto-approve registration and store payment details
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'approved',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        transactionId: razorpayPaymentId // Also store as transactionId for consistency
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Payment verified and registration auto-approved:', {
      registrationId,
      registrationCode: updatedRegistration.registrationCode,
      paymentId: razorpayPaymentId
    });

    res.json({
      success: true,
      verified: true,
      registration: {
        id: updatedRegistration.id,
        registrationCode: updatedRegistration.registrationCode,
        status: updatedRegistration.status,
        userName: updatedRegistration.user.name,
        userEmail: updatedRegistration.user.email
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

module.exports = router;
