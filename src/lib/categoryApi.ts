// Client-side utility functions for category API calls

import { ICategory } from '@/models/Category';

const BASE_URL = '/api/categories';

export interface CategoryAPIResponse {
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

export interface GetCategoriesOptions {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface CreateCategoryData {
  title: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  title?: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export class CategoryAPI {
  // Get all categories with optional filters
  static async getCategories(options: GetCategoriesOptions = {}): Promise<CategoryAPIResponse> {
    const { page = 1, limit = 10, search = '', activeOnly = false } = options;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(activeOnly && { activeOnly: 'true' })
    });

    try {
      const response = await fetch(`${BASE_URL}?${params}`);
      const data: CategoryAPIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get single category by ID or slug
  static async getCategory(id: string): Promise<CategoryAPIResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      const data: CategoryAPIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Create new category
  static async createCategory(categoryData: CreateCategoryData): Promise<CategoryAPIResponse> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      const data: CategoryAPIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<CategoryAPIResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      const data: CategoryAPIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  static async deleteCategory(id: string): Promise<CategoryAPIResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      const data: CategoryAPIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get only active categories (commonly used for frontend display)
  static async getActiveCategories(): Promise<CategoryAPIResponse> {
    return this.getCategories({ activeOnly: true, limit: 100 });
  }

  // Search categories
  static async searchCategories(searchTerm: string, limit: number = 10): Promise<CategoryAPIResponse> {
    return this.getCategories({ search: searchTerm, limit, activeOnly: true });
  }
}

// Individual functions for easier imports
export const getCategories = (options?: GetCategoriesOptions): Promise<CategoryAPIResponse> => 
  CategoryAPI.getCategories(options);

export const getCategory = (id: string): Promise<CategoryAPIResponse> => 
  CategoryAPI.getCategory(id);

export const createCategory = (categoryData: CreateCategoryData): Promise<CategoryAPIResponse> => 
  CategoryAPI.createCategory(categoryData);

export const updateCategory = (id: string, categoryData: UpdateCategoryData): Promise<CategoryAPIResponse> => 
  CategoryAPI.updateCategory(id, categoryData);

export const deleteCategory = (id: string): Promise<CategoryAPIResponse> => 
  CategoryAPI.deleteCategory(id);

export const getAllCategories = (): Promise<CategoryAPIResponse> => 
  CategoryAPI.getCategories();

export const searchCategories = (searchTerm: string, limit?: number): Promise<CategoryAPIResponse> => 
  CategoryAPI.searchCategories(searchTerm, limit);