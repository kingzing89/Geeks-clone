"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import CourseDetail from '../../components/CourseDetail';

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params); // Unwrap the params Promise

  const handleBack = () => {
    router.push('/'); 
  };

  return (
    <CourseDetail 
      courseId={resolvedParams.id} 
      onBack={handleBack}
    />
  );
}