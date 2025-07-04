import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  id: string;
  role: string;
  email: string;
  exp?: number;
  iat?: number;
}

export function getUserFromToken(token: string): CustomJwtPayload | null {
  try {
    return jwtDecode<CustomJwtPayload>(token);
  } catch {
    return null;
  }
}
