import { NextResponse } from 'next/server';
import { Documentation } from '@/models/Documentation';
import connectDB from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const doc = await Documentation.findOne({ 
      slug: params.slug, 
      isPublished: true 
    })
      .populate('category', 'title slug bgColor icon')
      .populate('documentSections', 'title slug content order description isPublished')
      .lean();
    
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
    console.error('Error fetching documentation by slug:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch documentation' 
      },
      { status: 500 }
    );
  }
}