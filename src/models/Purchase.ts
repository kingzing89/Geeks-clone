import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
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

// Create compound index to prevent duplicate purchases
PurchaseSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);