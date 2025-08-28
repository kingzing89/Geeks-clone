import React from 'react';
import { useRouter } from 'next/navigation';
import { Star, BarChart3, TrendingUp } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  level: string;
  rating: number;
  bgColor: string;
  courseType: string;
  subtitle?: string;
  technologies?: string;
  hasIcons?: boolean;
  hasLogos?: boolean;
}

const Courses: React.FC = () => {
  const router = useRouter();

  const courses: Course[] = [
    {
      id: 1,
      title: "DSA to Development: A Complete Guide",
      level: "Beginner to Advance",
      rating: 4.4,
      bgColor: "bg-gradient-to-br from-emerald-400 to-green-500",
      courseType: "DSA",
      subtitle: "Development"
    },
    {
      id: 2,
      title: "JAVA Backend Development - Live",
      level: "Intermediate and Advance",
      rating: 4.7,
      bgColor: "bg-gradient-to-br from-indigo-400 to-purple-500",
      courseType: "Backend",
      subtitle: "Development",
      hasIcons: true
    },
    {
      id: 3,
      title: "Full Stack Development with React & Node JS - Project...",
      level: "Beginner to Advance",
      rating: 3.5,
      bgColor: "bg-gradient-to-br from-teal-500 to-cyan-600",
      courseType: "Full Stack",
      subtitle: "Development",
      technologies: "with React & Node JS",
      hasLogos: true
    }
  ];

  const handleCourseClick = (courseId: number) => {
    router.push(`/course/${courseId}`);
  };

  const renderCourseImage = (course: Course) => {
    return (
      <div className={`${course.bgColor} relative overflow-hidden rounded-t-lg h-40 flex items-center justify-center text-white`}>
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{course.rating}</span>
        </div>

        {/* Course content */}
        <div className="text-center px-6">
          <div className="text-2xl font-bold mb-1">{course.courseType}</div>
          {course.subtitle && (
            <div className="text-lg opacity-90">{course.subtitle}</div>
          )}
          {course.technologies && (
            <div className="text-sm opacity-80 mt-1">{course.technologies}</div>
          )}
        </div>

        {/* Backend course icons */}
        {course.hasIcons && (
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-60">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white/60 rounded"></div>
            </div>
          </div>
        )}

        {/* Full Stack course logos */}
        {course.hasLogos && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <span className="text-xs font-bold">node</span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <div className="w-5 h-5 border-2 border-white rounded-full relative">
                <div className="absolute inset-1 border border-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button className="px-6 py-2 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium">
          View All
        </button>
      </div>

      {/* Courses Grid */}
      <div className="w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {/* Course Image */}
            {renderCourseImage(course)}

            {/* Course Info */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-tight">
                {course.title}
              </h3>

              {/* Level */}
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">{course.level}</span>
              </div>

              {/* Bottom section */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => handleCourseClick(course.id)}
                  className="text-green-600 font-medium text-sm hover:text-green-700 transition-colors duration-200"
                >
                  Explore now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;