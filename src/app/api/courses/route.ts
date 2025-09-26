import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/models/Course';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const page = parseInt(searchParams.get('page') || '1');
    const categoryId = searchParams.get('categoryId');
    const level = searchParams.get('level');
    const featured = searchParams.get('featured') === 'true';

    // Build query
    const query: any = { isPublished: true };
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (level) {
      query.level = level;
    }

    // For homepage, get featured courses or latest courses
    let courses;
    if (featured) {
      courses = await Course.find(query)
        .populate('categoryId', 'title slug')
        .sort({ rating: -1, studentCount: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();
    } else {
      courses = await Course.find(query)
        .populate('categoryId', 'title slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();
    }

    const total = await Course.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}