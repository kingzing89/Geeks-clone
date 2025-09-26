import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user using custom JWT middleware
    const authResult = await authenticate(request);

    console.log("auth-Result",authResult);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    const { 
      priceId, 
      documentId, 
      documentTitle, 
      successUrl, 
      cancelUrl 
    } = await request.json();

    console.log("User Id", user._id);

    // Create Stripe checkout session with metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        documentId: documentId.toString(),
        documentTitle: documentTitle,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}