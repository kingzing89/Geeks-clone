import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryMethods {
  toJSON(): ICategory;
}

export interface ICategoryStatics {
  findActive(): Promise<ICategory[]>;
}

export type CategoryModel = Model<ICategory, {}, ICategoryMethods> & ICategoryStatics;

const CategorySchema = new Schema<ICategory, CategoryModel, ICategoryMethods>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  content: {
    type: String,
  },
  bgColor: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#([0-9A-F]{3}){1,2}$/i, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    default: 'BookOpen' // Default Lucide icon name
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

// Index for better query performance
CategorySchema.index({ order: 1, isActive: 1 });
CategorySchema.index({ slug: 1 });

// Pre-save middleware to generate slug if not provided
CategorySchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Instance method to get formatted category
CategorySchema.methods.toJSON = function(): ICategory {
  const category = this.toObject({ versionKey: false });
  return category as ICategory;
};

// Static method to find all categories
CategorySchema.statics.findAll = function(): Promise<ICategory[]> {
  return this.find({}).sort({ order: 1, createdAt: -1 });
};

const Category = (mongoose.models.Category as CategoryModel) || 
  mongoose.model<ICategory, CategoryModel>('Category', CategorySchema);

export default Category;