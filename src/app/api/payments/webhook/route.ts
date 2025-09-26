import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!endpointSecret) {
    console.error('Webhook secret not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Handle successful payment
        await handleSuccessfulPayment(session);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Handle failed payment
        await handleFailedPayment(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(session: any) {
  try {
    const { documentId, documentTitle } = session.metadata || {};
    
    console.log('Payment successful for:', {
      sessionId: session.id,
      documentId,
      documentTitle,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
    });

    // Here you can:
    // 1. Grant user access to the document in your database
    // 2. Send confirmation email
    // 3. Update user's purchase history
    // 4. Update analytics/metrics
    
    // Example database update (uncomment and modify for your database):
    /*
    await updateUserAccess({
      email: session.customer_details?.email,
      documentId,
      accessGranted: true,
      purchaseDate: new Date(),
      sessionId: session.id
    });
    */
    
  } catch (error: any) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent: any) {
  try {
    console.log('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
    });
    
    // Handle failed payment (e.g., send notification, log for analytics)
  } catch (error: any) {
    console.error('Error handling failed payment:', error);
  }
}

