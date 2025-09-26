import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, BarChart3, Loader2 } from 'lucide-react';
import { getFeaturedCourses } from '@/lib/courseApi';

interface CourseData {
  _id: string;
  title: string;
  description?: string;
  level: string;
  rating: number;
  studentCount: number;
  duration?: string;
  instructor?: string;
  bgColor?: string;
  price?: number;
  isPremium: boolean;
  categoryId: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Courses: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await getFeaturedCourses(6);
        
        if (response.success && response.data.length > 0) {
          setCourses(response.data);
        } 
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Updated handleCourseClick function
  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`); // Changed from /course/ to /courses/
  };

  const formatLevel = (level: string) => {
    switch (level) {
      case 'BEGINNER_TO_ADVANCE':
        return 'Beginner to Advance';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'ADVANCED':
        return 'Advanced';
      case 'BEGINNER':
        return 'Beginner';
      default:
        return level;
    }
  };

  const getDefaultBgColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-emerald-400 to-green-500",
      "bg-gradient-to-br from-indigo-400 to-purple-500",
      "bg-gradient-to-br from-teal-500 to-cyan-600",
      "bg-gradient-to-br from-orange-400 to-red-500",
      "bg-gradient-to-br from-pink-400 to-rose-500",
      "bg-gradient-to-br from-violet-400 to-purple-600"
    ];
    return colors[index % colors.length];
  };

  const renderCourseImage = (course: CourseData, index: number) => {
    const bgColor = course.bgColor || getDefaultBgColor(index);
    
    return (
      <div className={`${bgColor} relative overflow-hidden rounded-t-lg h-40 flex items-center justify-center text-white`}>
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
        </div>

        {/* Premium badge */}
        {course.isPremium && (
          <div className="absolute top-3 left-3 bg-yellow-500/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-bold text-white">PREMIUM</span>
          </div>
        )}

        {/* Course content */}
        <div className="text-center px-6">
          <div className="text-2xl font-bold mb-1">{course.categoryId.title}</div>
          <div className="text-lg opacity-90">Development</div>
          {course.studentCount > 0 && (
            <div className="text-sm opacity-80 mt-1">{course.studentCount.toLocaleString()} students</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button 
          onClick={() => router.push('/courses')}
          className="px-6 py-2 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          View All
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-700">Notice: {error}</p>
          <p className="text-sm text-yellow-600 mt-1">Showing sample courses.</p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div 
            key={course._id} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
            onClick={() => handleCourseClick(course._id)}
          >
            {/* Course Image */}
            {renderCourseImage(course, index)}

            {/* Course Info */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-tight line-clamp-2">
                {course.title}
              </h3>

              {/* Level */}
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">{formatLevel(course.level)}</span>
              </div>

              {/* Bottom section - Updated with click handler for "Explore now" */}
              <div className="flex justify-between items-center">
                <button 
                  className="text-green-600 font-medium text-sm hover:text-green-700 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from also firing
                    router.push(`/courses/${course._id}`); // Navigate to course detail
                  }}
                >
                  Explore now
                </button>
                {course.price && course.price > 0 ? (
                  <span className="text-gray-800 font-semibold">₹{course.price.toLocaleString()}</span>
                ) : (
                  <span className="text-green-600 font-semibold">Free</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;