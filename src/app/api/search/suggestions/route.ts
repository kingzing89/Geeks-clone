import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { Documentation } from '@/models/Documentation';
import Category from '@/models/Category';

export interface SearchSuggestion {
  text: string;
  type: 'course' | 'documentation' | 'category' | 'keyword';
  count?: number;
}

export interface SuggestionsResponse {
  success: boolean;
  data?: SearchSuggestion[];
  error?: string;
}

// GET /api/search/suggestions - Get search suggestions
export async function GET(request: NextRequest): Promise<NextResponse<SuggestionsResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const searchRegex = { $regex: `^${query}`, $options: 'i' };
    const suggestions: SearchSuggestion[] = [];

    // Get category suggestions
    const categories = await Category.find({
      title: searchRegex,
      isActive: true
    })
    .select('title')
    .limit(3)
    .lean();

    categories.forEach(cat => {
      suggestions.push({
        text: cat.title,
        type: 'category'
      });
    });

    // Get course title suggestions
    const courses = await Course.find({
      title: searchRegex,
      isPublished: true
    })
    .select('title')
    .limit(4)
    .lean();

    courses.forEach(course => {
      suggestions.push({
        text: course.title,
        type: 'course'
      });
    });

    // Get documentation title suggestions
    const docs = await Documentation.find({
      title: searchRegex,
      isPublished: true
    })
    .select('title')
    .limit(3)
    .lean();

    docs.forEach(doc => {
      suggestions.push({
        text: doc.title,
        type: 'documentation'
      });
    });

    // Popular keywords/topics (you can expand this based on your content)
    const popularKeywords = [
      'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
      'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Machine Learning',
      'Data Structures', 'Algorithms', 'System Design', 'API Design',
      'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Testing'
    ];

    const matchingKeywords = popularKeywords.filter(keyword =>
      keyword.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 3);

    matchingKeywords.forEach(keyword => {
      suggestions.push({
        text: keyword,
        type: 'keyword'
      });
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: uniqueSuggestions
    });

  } catch (error: any) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch suggestions',
        message: error.message 
      },
      { status: 500 }
    );
  }
}