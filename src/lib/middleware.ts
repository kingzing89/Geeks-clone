import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { User } from '@/models/User';
import connectDB from './mongodb';

export async function authenticate(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { error: 'Invalid token', status: 401 };
    }

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user, status: 200 };
  } catch (error) {
    return { error: 'Authentication failed', status: 401 };
  }
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await authenticate(request);
  
  if (authResult.error) {
    return authResult;
  }

  const { user } = authResult;
  
  if (!allowedRoles.includes(user.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user, status: 200 };
}