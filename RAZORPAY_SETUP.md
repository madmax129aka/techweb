# Razorpay Integration Setup Guide

## ✅ Installation Complete

The `razorpay` package (v2.9.8) is now installed in the server.

## 🔑 Get Your API Keys

### Step 1: Sign Up for Razorpay

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Sign up with your email
3. Complete email verification
4. Fill in business details (can use test details for now)

### Step 2: Activate Test Mode

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Make sure you're in **Test Mode** (toggle in top-right corner)
3. Navigate to **Settings** → **API Keys**
4. Click **Generate Test Key** if keys don't exist

### Step 3: Copy Your Keys

You'll see two keys:
- **Key ID**: `rzp_test_xxxxxxxxxxxxxxxx` (safe to expose in frontend)
- **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxx` (MUST stay server-side only)

### Step 4: Update .env File

Edit `server/.env` and replace the placeholder values:

```env
RAZORPAY_KEY_ID="rzp_test_your_actual_key_id_here"
RAZORPAY_KEY_SECRET="your_actual_key_secret_here"
```

**Security Note:** Never commit real keys to version control. Add `.env` to `.gitignore`.

## 🧪 Test the Integration

### Test Credentials (Razorpay Test Mode)

Use these test payment methods:

#### Test Credit/Debit Card
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/28`)
- **Name**: Any name (e.g., `Test User`)

#### Test UPI
- **UPI ID**: `success@razorpay`
- This will simulate a successful payment

#### Test Netbanking
- Select any bank
- Use the test credentials provided on Razorpay's test page

### Test Flow

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Add events to cart** on the frontend

3. **Proceed to checkout** - Razorpay modal should open

4. **Use test card** details above

5. **Submit payment** - should auto-approve registration

6. **Check dashboard** - ID card should be generated immediately

## 🚀 Going Live (Production)

When ready for real payments:

1. Complete KYC verification in Razorpay Dashboard
2. Activate Live mode in dashboard
3. Generate **Live API Keys** (Settings → API Keys)
4. Update `.env` with live keys:
   ```env
   RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
   RAZORPAY_KEY_SECRET="live_key_secret_here"
   ```
5. Test with small real payment first
6. Monitor transactions in Razorpay Dashboard

## 🔒 Security Checklist

- [x] Razorpay package installed
- [ ] Test keys configured in `.env`
- [ ] `.env` file is in `.gitignore`
- [ ] Key Secret never exposed to frontend
- [ ] Signature verification enabled (already implemented)
- [ ] HTTPS enabled in production
- [ ] Tested with test cards before going live

## 📊 Payment Flows

### Online Payment (Razorpay)
```
User Checkout
    ↓
Create Registration (status: pending)
    ↓
Create Razorpay Order (/api/payment/create-order)
    ↓
Open Razorpay Modal
    ↓
User Pays
    ↓
Verify Signature (/api/payment/verify)
    ↓
Auto-Approve Registration
    ↓
Show ID Card
```

### Cash Payment (Registration Team)
```
Team Member Fills Form
    ↓
Create Registration (paymentMethod: cash)
    ↓
Auto-Approve (cash collected in-person)
    ↓
Display ID Card on Screen
    ↓
Participant Photographs QR
```

## 🐛 Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Verify `RAZORPAY_KEY_ID` is set in `.env`
- Restart server after updating `.env`

### Payment Verification Fails
- Check `RAZORPAY_KEY_SECRET` is correct
- Verify signature verification logic in `server/routes/payment.js`
- Check server logs for detailed error messages

### "Razorpay not configured" Error
- Ensure both keys are set in `server/.env`
- No quotes or extra spaces in key values
- Restart the server

### Payment Succeeds but Registration Not Approved
- Check database `paymentMethod` field
- Verify `/api/payment/verify` endpoint is being called
- Check server logs for errors

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Test Mode**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Support**: support@razorpay.com

## ✨ Next Steps

1. Get your test keys from Razorpay Dashboard
2. Update `server/.env` with real test keys
3. Restart the server
4. Test the entire flow with test card
5. Monitor transactions in Razorpay Dashboard
