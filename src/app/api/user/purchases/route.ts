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
    .populate({
      path: 'courseId',
      select: 'title _id',
    })
    .sort({ purchaseDate: -1 });

    const purchasedDocumentIds = purchases
      .filter(p => p.documentId)
      .map(p => p.documentId!.toString());
    const purchasedCourseIds = purchases
      .filter(p => p.courseId)
      .map(p => p.courseId!.toString());

    // Note: courses are in the same purchases collection

    return NextResponse.json({
      success: true,
      data: {
        purchases: purchases,
        purchasedDocumentIds: purchasedDocumentIds,
        purchasedCourseIds: purchasedCourseIds,
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
    const { documentId, courseId } = await request.json();

    if (documentId) {
      const purchase = await Purchase.findOne({
        userId: user._id,
        documentId: documentId,
        status: 'completed',
      });

      return NextResponse.json({
        success: true,
        data: {
          hasPurchased: !!purchase,
          purchase: purchase,
          type: 'document',
        },
      });
    }

    if (courseId) {
      const purchase = await Purchase.findOne({
        userId: user._id,
        courseId: courseId,
        status: 'completed',
      });

      return NextResponse.json({
        success: true,
        data: {
          hasPurchased: !!purchase,
          purchase: purchase,
          type: 'course',
        },
      });
    }

    return NextResponse.json({
      error: 'documentId or courseId is required',
    }, { status: 400 });

  } catch (error) {
    console.error('Check document purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}