import mongoose, { Document, Schema } from 'mongoose';

export interface ICoursePurchase extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoursePurchaseSchema = new Schema<ICoursePurchase>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  stripeSessionId: {
    type: String,
    sparse: true,
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Prevent duplicate course purchases per user
CoursePurchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CoursePurchase = mongoose.models.CoursePurchase || mongoose.model<ICoursePurchase>('CoursePurchase', CoursePurchaseSchema);


