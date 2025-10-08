import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user using custom JWT middleware
    const authResult = await authenticate(request);

    console.log("auth-Result", authResult);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    const body = await request.json();
    const {
      // common
      priceId,
      // document purchase fields (docs)
      documentId,
      documentTitle,
      documentSlug,
      // course purchase fields (courses)
      courseId,
      courseTitle,
      courseSlug,
      // optional client-provided urls
      successUrl: clientSuccessUrl,
      cancelUrl: clientCancelUrl,
    } = body as {
      priceId?: string;
      documentId?: string;
      documentTitle?: string;
      documentSlug?: string;
      courseId?: string;
      courseTitle?: string;
      courseSlug?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    console.log("User Id", user._id);

    // Get the base URL from the request or environment variable
    const baseUrl = process.env.NEXTAUTH_URL || 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    
    // Determine resource type (document vs course)
    const isDocumentPurchase = Boolean(documentId || documentSlug);
    const isCoursePurchase = Boolean(courseId || courseSlug);

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    if (!isDocumentPurchase && !isCoursePurchase) {
      return NextResponse.json({ error: 'Missing resource identifiers (document or course)' }, { status: 400 });
    }

    // Construct URLs (prefer client-provided, else build)
    let successUrl = clientSuccessUrl;
    let cancelUrl = clientCancelUrl;

    if (!successUrl || !cancelUrl) {
      if (isDocumentPurchase) {
        const encoded = encodeURIComponent(documentSlug || '');
        successUrl = successUrl || `${baseUrl}/docs/${encoded}?session_id={CHECKOUT_SESSION_ID}`;
        cancelUrl = cancelUrl || `${baseUrl}/docs/${encoded}`;
      } else {
        const pathIdOrSlug = courseSlug ? encodeURIComponent(courseSlug) : encodeURIComponent(courseId || '');
        successUrl = successUrl || `${baseUrl}/courses/${pathIdOrSlug}?session_id={CHECKOUT_SESSION_ID}`;
        cancelUrl = cancelUrl || `${baseUrl}/courses/${pathIdOrSlug}`;
      }
    }

    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);

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
        // include whichever resource is relevant
        ...(isDocumentPurchase
          ? {
              documentId: documentId || '',
              documentTitle: documentTitle || '',
              documentSlug: documentSlug || '',
            }
          : {
              courseId: courseId || '',
              courseTitle: courseTitle || '',
              courseSlug: courseSlug || '',
            }),
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