import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function Authorized() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, user: null, message: 'No token' };
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      return {
        success: true,
        user: decoded,
        message: 'Authorized'
      };
    } catch (error) {
      return { success: false, user: null, message: 'Invalid token' };
    }
  } catch (error) {
    return { success: false, user: null, message: 'Server error' };
  }
}
