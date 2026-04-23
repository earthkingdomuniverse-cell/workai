import { authRepository } from './repository';
import { hashPassword, verifyPassword } from './password';
import { generateAccessToken, generateRefreshToken, getTokenExpiry } from './token';
import { AuthUser, AuthResponse, SignupInput, LoginInput, UserRole } from './types';
import { AppError } from '../../lib/errors';

function toSafeUser(user: AuthUser & { passwordHash?: string; passwordSalt?: string }): AuthUser {
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safeUser } = user;
  return safeUser;
}

export async function signup(input: SignupInput & { role?: UserRole }): Promise<AuthResponse> {
  const existing = await authRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError('Email already registered', {
      code: 'CONFLICT_ERROR',
      statusCode: 409,
    });
  }

  const { hash, salt } = hashPassword(input.password);

  const user = await authRepository.create({
    email: input.email,
    passwordHash: hash,
    passwordSalt: salt,
    role: input.role || 'member',
  });

  const token = await generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken({
    userId: user.id,
    type: 'refresh',
  });

  return {
    user,
    token,
    refreshToken,
    expiresAt: getTokenExpiry(),
    refreshTokenExpiresAt: getTokenExpiry('30d'),
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await authRepository.findByEmail(input.email);

  if (!user) {
    throw new AppError('Invalid credentials', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }

  const valid = verifyPassword(input.password, user.passwordHash, user.passwordSalt);
  if (!valid) {
    throw new AppError('Invalid credentials', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }

  const token = await generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken({
    userId: user.id,
    type: 'refresh',
  });

  return {
    user: toSafeUser(user),
    token,
    refreshToken,
    expiresAt: getTokenExpiry(),
    refreshTokenExpiresAt: getTokenExpiry('30d'),
  };
}

export async function refreshToken(refreshTokenStr: string): Promise<AuthResponse> {
  const {
    verifyRefreshToken,
    generateAccessToken: generateNewAccessToken,
    generateRefreshToken: generateNewRefreshToken,
  } = await import('./token');

  try {
    const payload = await verifyRefreshToken(refreshTokenStr);

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', {
        code: 'NOT_FOUND_ERROR',
        statusCode: 404,
      });
    }

    const token = await generateNewAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await generateNewRefreshToken({
      userId: user.id,
      type: 'refresh',
    });

    return {
      user: toSafeUser(user),
      token,
      refreshToken: newRefreshToken,
      expiresAt: getTokenExpiry(),
      refreshTokenExpiresAt: getTokenExpiry('30d'),
    };
  } catch (error) {
    throw new AppError('Invalid refresh token', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  return authRepository.findById(id);
}

export async function getUserByEmail(
  email: string,
): Promise<(AuthUser & { passwordHash?: string; passwordSalt?: string }) | null> {
  return authRepository.findByEmail(email);
}

export async function updateOnboardingStatus(
  userId: string,
  onboardingCompleted: boolean,
): Promise<AuthUser> {
  return authRepository.update(userId, { onboardingCompleted });
}
