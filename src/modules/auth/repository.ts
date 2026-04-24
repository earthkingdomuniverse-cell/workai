import { prisma } from '../../db/prismaClient';
import { AuthUser, UserRole } from './types';

interface UserRecord extends AuthUser {
  passwordHash: string;
  passwordSalt: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<AuthUser | null>;
  create(data: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: UserRole;
  }): Promise<AuthUser>;
  update(id: string, data: Partial<AuthUser>): Promise<AuthUser>;
  delete(id: string): Promise<void>;
}

function permissionsForRole(role: string): string[] {
  if (role === 'admin') return ['read', 'write', 'delete', 'admin'];
  if (role === 'operator') return ['read', 'write', 'delete'];
  return ['read', 'write'];
}

function toAuthUser(row: any): AuthUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    permissions: row.permissions ? row.permissions.split(',') : permissionsForRole(row.role),
    onboardingCompleted: row.onboardingCompleted,
    trustScore: row.trustScore ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

function toUserRecord(row: any): UserRecord {
  return {
    ...toAuthUser(row),
    passwordHash: row.passwordHash,
    passwordSalt: row.passwordSalt,
  };
}

class PrismaAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return toUserRecord(user);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return toAuthUser(user);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: UserRole;
  }): Promise<AuthUser> {
    const permissions = permissionsForRole(data.role);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        passwordSalt: data.passwordSalt,
        role: data.role,
        permissions: permissions.join(','),
        onboardingCompleted: false,
      },
    });
    return toAuthUser(user);
  }

  async update(id: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.onboardingCompleted !== undefined)
      updateData.onboardingCompleted = data.onboardingCompleted;
    if (data.trustScore !== undefined) updateData.trustScore = data.trustScore;
    if (data.permissions !== undefined) updateData.permissions = data.permissions.join(',');

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toAuthUser(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}

export const authRepository: AuthRepository = new PrismaAuthRepository();
