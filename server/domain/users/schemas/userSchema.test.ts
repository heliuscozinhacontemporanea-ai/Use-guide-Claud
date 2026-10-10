import { describe, it, expect } from 'vitest';
import {
  loginUserSchema,
  registerUserSchema,
  forgotPasswordSchema,
  updateUserProfileSchema,
} from './userSchema';

describe('User Validation Schemas (Backend)', () => {
  describe('loginUserSchema', () => {
    it('should validate valid email and password', () => {
      const result = loginUserSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginUserSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerUserSchema', () => {
    it('should validate full user registration input', () => {
      const result = registerUserSchema.safeParse({
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@example.com',
        password: 'Password123#',
        phone: '(85) 98888-7777',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with weak password', () => {
      const result = registerUserSchema.safeParse({
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@example.com',
        password: 'weak',
        phone: '(85) 98888-7777',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateUserProfileSchema', () => {
    it('should validate profile updates', () => {
      const result = updateUserProfileSchema.safeParse({
        firstName: 'Maria',
        lastName: 'Silva Nova',
        phone: '(85) 99999-0000',
      });
      expect(result.success).toBe(true);
    });
  });
});
