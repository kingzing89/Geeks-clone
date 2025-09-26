import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { Documentation } from '@/models/Documentation';
import Category from '@/models/Category';
import { Types } from 'mongoose';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'documentation' | 'category';
  slug: string;
  category?: {
    title: string;
    slug: string;
  };
  rating?: number;
  studentCount?: number;
  level?: string;
  bgColor?: string;
  icon?: string;
}

export interface SearchResponse {
  success: boolean;
  data?: {
    courses: SearchResult[];
    documentation: SearchResult[];
    categories: SearchResult[];
    total: number;
  };
  error?: string;
  message?: string;
}

// GET /api/search - Search across courses, documentation, and categories
export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'course', 'documentation', 'category', or undefined for all

    if (!query) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          documentation: [],
          categories: [],
          total: 0
        }
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const searchCondition = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex }
      ]
    };

    const results: {
      courses: SearchResult[];
      documentation: SearchResult[];
      categories: SearchResult[];
    } = {
      courses: [],
      documentation: [],
      categories: []
    };

    // Search courses
    if (!type || type === 'course') {
      const courses = await Course.find({
        ...searchCondition,
        isPublished: true
      })
      .populate('categoryId', 'title slug')
      .sort({ rating: -1, studentCount: -1 })
      .limit(limit)
      .lean<{
        _id: Types.ObjectId;
        title: string;
        description?: string;
        slug: string;
        categoryId?: { title: string; slug: string };
        rating?: number;
        studentCount?: number;
        level?: string;
      }[]>();

      results.courses = courses.map(course => ({
        id: String(course._id),
        title: course.title,
        description: course.description,
        type: 'course' as const,
        slug: course.slug,
        category: course.categoryId ? {
          title: course.categoryId.title,
          slug: course.categoryId.slug
        } : undefined,
        rating: course.rating,
        studentCount: course.studentCount,
        level: course.level
      }));
    }

    // Search documentation
    if (!type || type === 'documentation') {
      const docs = await Documentation.find({
        ...searchCondition,
        isPublished: true
      })
      .populate('category', 'title slug bgColor icon')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<{
        _id: Types.ObjectId;
        title: string;
        description?: string;
        slug: string;
        category?: { title: string; slug: string };
      }[]>();

      results.documentation = docs.map(doc => ({
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        type: 'documentation' as const,
        slug: doc.slug,
        category: doc.category ? {
          title: doc.category.title,
          slug: doc.category.slug
        } : undefined
      }));
    }

    // Search categories
    if (!type || type === 'category') {
      const categories = await Category.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ],
        isActive: true
      })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean<{
        _id: Types.ObjectId;
        title: string;
        description?: string;
        slug: string;
        bgColor?: string;
        icon?: string;
      }[]>();

      results.categories = categories.map(category => ({
        id: String(category._id),
        title: category.title,
        description: category.description,
        type: 'category' as const,
        slug: category.slug,
        bgColor: category.bgColor,
        icon: category.icon
      }));
    }

    const total = results.courses.length + results.documentation.length + results.categories.length;

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        total
      }
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}