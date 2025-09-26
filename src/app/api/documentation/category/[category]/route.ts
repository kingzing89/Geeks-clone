import { NextResponse } from 'next/server';
import { Documentation } from '@/models/Documentation';
import connectDB from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    await connectDB();
    
    const docs = await Documentation.find({ 
      category: params.category, 
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    return NextResponse.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching documentation by category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch documentation' 
      },
      { status: 500 }
    );
  }
}