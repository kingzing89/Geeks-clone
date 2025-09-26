import { NextRequest, NextResponse } from 'next/server';
import { Course, CourseSection } from '@/models/Course';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await Course.findById(id)
      .populate('categoryId', 'title slug description')
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (!(course as any).isPublished) {
      return NextResponse.json(
        { success: false, error: 'Course is not available' },
        { status: 404 }
      );
    }

    // Get course sections
    const sections = await CourseSection.find({ courseId: id })
      .sort({ order: 1 })
      .lean();

    // Get related courses (same category, excluding current course)
    const relatedCourses = await Course.find({
      categoryId: (course as any).categoryId,
      _id: { $ne: id },
      isPublished: true
    })
      .limit(3)
      .sort({ rating: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        course,
        sections,
        relatedCourses
      }
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}