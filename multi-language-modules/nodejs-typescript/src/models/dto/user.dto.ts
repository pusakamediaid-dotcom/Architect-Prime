export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: AddressDto;
  role?: UserRole;
  metadata?: Record<string, unknown>;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  address?: AddressDto | null;
  avatar?: string | null;
  role?: UserRole;
  status?: UserStatus;
  metadata?: Record<string, unknown>;
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  address: AddressDto | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  avatar: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';

export interface PaginationDto {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface UserFilterDto {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationDto;
}

export const UserRoleValues: UserRole[] = ['admin', 'moderator', 'user', 'guest'];
export const UserStatusValues: UserStatus[] = ['active', 'inactive', 'suspended', 'banned'];
