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

class InMemoryAuthRepository implements AuthRepository {
  private users: Map<string, UserRecord> = new Map();

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const { passwordHash, passwordSalt, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: UserRole;
  }): Promise<AuthUser> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const user: UserRecord = {
      id,
      email: data.email,
      role: data.role,
      permissions: data.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
      onboardingCompleted: false,
      trustScore: undefined,
      passwordHash: data.passwordHash,
      passwordSalt: data.passwordSalt,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);

    const { passwordHash, passwordSalt, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User ${id} not found`);
    }

    const updated: UserRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    } as UserRecord;

    this.users.set(id, updated);

    const { passwordHash, passwordSalt, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

export const authRepository: AuthRepository = new InMemoryAuthRepository();
