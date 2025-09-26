import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentation extends Document {
    title: string;
    slug: string;
    description?: string;
    content: string;
    category: mongoose.Types.ObjectId; // Reference to Category document
    readTime?: string;
    keyFeatures: string[];
    codeExamples: Array<{
      title: string;
      code: string;
      description: string;
    }>;
    documentSections: mongoose.Types.ObjectId[]; // References to other Documentation documents
    proTip?: string;
    isPublished: boolean;
    // New pricing fields
    price?: number;
    currency?: string;
    stripePriceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentationSchema = new Schema<IDocumentation>({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    readTime: {
      type: String,
    },
    keyFeatures: [{
      type: String,
    }],
    codeExamples: [{
      title: { type: String, required: true },
      code: { type: String, required: true },
      description: { type: String, required: true },
    }],
    documentSections: [{
      type: Schema.Types.ObjectId,
      ref: 'Documentation'
    }],
    proTip: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // New pricing fields
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
      enum: ['usd', 'eur', 'gbp', 'cad', 'aud'], // Add more currencies as needed
    },
    stripePriceId: {
      type: String,
      trim: true,
    },
}, {
    timestamps: true,
});

export const Documentation = mongoose.models.Documentation || mongoose.model<IDocumentation>('Documentation', DocumentationSchema);