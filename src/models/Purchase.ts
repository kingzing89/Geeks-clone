import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  resourceType: 'document' | 'course';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Documentation',
    required: false,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  },
  resourceType: {
    type: String,
    enum: ['document', 'course'],
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

// Create compound indexes to prevent duplicate purchases per resource type
PurchaseSchema.index(
  { userId: 1, documentId: 1 },
  { unique: true, partialFilterExpression: { documentId: { $ne: null } } }
);
PurchaseSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { courseId: { $ne: null } } }
);

export const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);