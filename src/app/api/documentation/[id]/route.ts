import { NextResponse } from 'next/server';
import { Documentation } from '@/models/Documentation';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Try to find by slug first, then fall back to _id if it's a valid ObjectId
    let doc;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      // If it's a valid ObjectId, try both slug and _id
      doc = await Documentation.findOne({ 
        $or: [
          { slug: id },
          { _id: id }
        ],
        isPublished: true 
      })
        .populate('category', 'title slug bgColor icon')
        .populate('documentSections', 'title slug content order description isPublished')
        .lean();
    } else {
      // If it's not a valid ObjectId, search by slug only
      doc = await Documentation.findOne({ 
        slug: id, 
        isPublished: true 
      })
        .populate('category', 'title slug bgColor icon')
        .populate('documentSections', 'title slug content order description isPublished')
        .lean();
    }
    
    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Documentation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch documentation' 
      },
      { status: 500 }
    );
  }
}