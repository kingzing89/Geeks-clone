import { NextResponse } from 'next/server';
import { Documentation } from '@/models/Documentation';
import connectDB from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields');
    
    let query = Documentation.find({ isPublished: true })
      .populate('category', 'title slug bgColor icon')
      .populate('documentSections', 'title slug description isPublished')
      .sort({ createdAt: -1 });
    
    // Apply field selection if specified
    if (fields) {
      const fieldArray = fields.split(',').map(field => field.trim());
      query = query.select(fieldArray.join(' '));
    }
    
    const docs = await query.lean();
    
    return NextResponse.json({
      success: true,
      data: docs
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