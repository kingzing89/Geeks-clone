import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import Stripe from 'stripe';
import { Purchase } from '@/models/Purchase';
import connectDB from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Use JWT authentication instead of NextAuth
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const documentId = checkoutSession.metadata?.documentId;
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID not found in session' },
        { status: 400 }
      );
    }

    // Check for existing purchase using JWT user ID
    const existingPurchase = await Purchase.findOne({
      userId: user._id, // Use user._id from JWT instead of session.user.id
      documentId: documentId,
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        message: 'Document already purchased',
        purchase: existingPurchase,
      });
    }

    // Create new purchase record
    const purchase = new Purchase({
      userId: user._id, // Use user._id from JWT instead of session.user.id
      documentId: documentId,
      stripeSessionId: sessionId,
      stripePaymentIntentId: checkoutSession.payment_intent?.id,
      amount: (checkoutSession.amount_total || 0) / 100, // Handle null case and convert from cents
      currency: checkoutSession.currency,
      status: 'completed',
      purchaseDate: new Date(),
    });

    await purchase.save();

    return NextResponse.json({
      success: true,
      message: 'Purchase recorded successfully',
      purchase: purchase,
    });

  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}