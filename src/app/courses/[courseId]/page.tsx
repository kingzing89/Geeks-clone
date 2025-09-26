import { use } from 'react';
import CourseDetail from '@/app/components/CourseDetail';

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const { courseId } = use(params);
  
  return <CourseDetail courseId={courseId} />;
}