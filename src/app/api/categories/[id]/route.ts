import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category, { ICategory } from '@/models/Category';
import { isValidObjectId } from 'mongoose';

export interface CategoryResponse {
  success: boolean;
  data?: ICategory;
  error?: string;
  message?: string;
}

export interface UpdateCategoryRequest {
  title?: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/categories/[id] - Get category by ID or slug
export async function GET(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<CategoryResponse>> {
  try {
    await connectDB();
    
    const { id } = params;

    // Find by ObjectId or slug
    const query = isValidObjectId(id) 
      ? { _id: id } 
      : { slug: id };

    const category = await Category.findOne(query);

    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not found',
          message: 'Category not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error: any) {
    console.error('Category GET by ID error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch category',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<CategoryResponse>> {
  try {
    await connectDB();
    
    const { id } = params;
    const body: UpdateCategoryRequest = await request.json();

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ID',
          message: 'Invalid category ID provided' 
        },
        { status: 400 }
      );
    }

    // Update category
    const category = await Category.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not found',
          message: 'Category not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (error: any) {
    console.error('Category PUT error:', error);
    
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
        error: 'Failed to update category',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<CategoryResponse | { success: boolean; message: string; data: { deletedId: string } }>> {
  try {
    await connectDB();
    
    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ID',
          message: 'Invalid category ID provided' 
        },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not found',
          message: 'Category not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: { deletedId: id }
    });

  } catch (error: any) {
    console.error('Category DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete category',
        message: error.message 
      },
      { status: 500 }
    );
  }
}