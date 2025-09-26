export interface CourseFilters {
    limit?: number;
    page?: number;
    categoryId?: string;
    level?: string;
    featured?: boolean;
  }
  
  export async function getAllCourses(filters: CourseFilters = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
  
      const response = await fetch(`/api/courses?${searchParams.toString()}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }
  
      return data;
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      throw error;
    }
  }
  
  export async function getCourseById(id: string) {
    try {
      const response = await fetch(`/api/courses/${id}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course');
      }
  
      return data;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }
  
  export async function getFeaturedCourses(limit: number = 3) {
    return getAllCourses({ featured: true, limit });
  }
  
  export async function getCoursesByCategory(categoryId: string, limit?: number) {
    return getAllCourses({ categoryId, limit });
  }