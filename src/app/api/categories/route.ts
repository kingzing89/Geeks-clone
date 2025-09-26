import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import type { ICategory } from '@/models/Category';

export interface CategoryResponse {
  success: boolean;
  data?: ICategory | ICategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
  message?: string;
}

export interface CreateCategoryRequest {
  title: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

// GET /api/categories - Get all categories
export async function GET(request: NextRequest): Promise<NextResponse<CategoryResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (activeOnly) {
      query.isActive = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get categories with pagination
    const categories = await Category
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Category.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest): Promise<NextResponse<CategoryResponse>> {
  try {
    await connectDB();

    const body: CreateCategoryRequest = await request.json();
    const { title, description, content, bgColor, icon, order, isActive } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Title is required' 
        },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      title,
      description,
      content,
      bgColor,
      icon,
      order,
      isActive
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Category created successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Category POST error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
        },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: messages.join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category',
        message: error.message 
      },
      { status: 500 }
    );
  }
}