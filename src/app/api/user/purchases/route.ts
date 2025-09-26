// app/api/user/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware'; // Use your JWT middleware
import { Purchase } from '@/models/Purchase';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
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

    const purchases = await Purchase.find({
      userId: user._id, // Use user._id from JWT instead of session.user.id
      status: 'completed',
    })
    .populate({
      path: 'documentId',
      select: 'title slug description category price',
      populate: {
        path: 'category',
        select: 'title',
      },
    })
    .sort({ purchaseDate: -1 });

    const purchasedDocumentIds = purchases.map(purchase => 
      purchase.documentId.toString()
    );

    return NextResponse.json({
      success: true,
      data: {
        purchases: purchases,
        purchasedDocumentIds: purchasedDocumentIds,
      },
    });

  } catch (error) {
    console.error('Get user purchases error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { documentId } = await request.json();

    const purchase = await Purchase.findOne({
      userId: user._id, // Use user._id from JWT instead of session.user.id
      documentId: documentId,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      data: {
        hasPurchased: !!purchase,
        purchase: purchase,
      },
    });

  } catch (error) {
    console.error('Check document purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}