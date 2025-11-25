import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  avatar?: string;
  resetPasswordToken?: string,
  resetPasswordExpires?: Date,
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'INSTRUCTOR'],
    default: 'USER',
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
    // default: null,
  },

  resetPasswordExpires: {
    type: Date,
    // default: null,
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);