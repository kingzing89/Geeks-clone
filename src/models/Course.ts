// src/lib/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';


export interface ICourse extends Document {
    title: string;
    description?: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'BEGINNER_TO_ADVANCE';
    rating: number;
    studentCount: number;
    duration?: string;
    instructor?: string;
    bgColor?: string;
    price?: number;
    isPremium: boolean;
    isPublished: boolean;
    categoryId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const CourseSchema = new Schema<ICourse>({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'BEGINNER_TO_ADVANCE'],
      default: 'BEGINNER',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    studentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: String,
    },
    instructor: {
      type: String,
      trim: true,
    },
    bgColor: {
      type: String,
    },
    price: {
      type: Number,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  }, {
    timestamps: true,
  });
  
  export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
  
  // src/lib/models/CourseSection.ts
  export interface ICourseSection extends Document {
    title: string;
    content: string;
    order: number;
    courseId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const CourseSectionSchema = new Schema<ICourseSection>({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  }, {
    timestamps: true,
  });
  
  export const CourseSection = mongoose.models.CourseSection || mongoose.model<ICourseSection>('CourseSection', CourseSectionSchema);