import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema } from './authSchema';

describe('Auth Validation Schemas (Frontend)', () => {
  describe('loginSchema', () => {
    it('should validate valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain('Formato de e-mail inválido');
      }
    });

    it('should fail with empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain('Senha é obrigatória');
      }
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      firstName: 'João',
      lastName: 'Silva',
      phone: '(85) 99999-9999',
      countryCode: '+55',
      email: 'joao@example.com',
      password: 'Password123#',
      confirmPassword: 'Password123#',
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should fail when firstName is missing', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        firstName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.firstName).toContain('Nome é obrigatório');
      }
    });

    it('should fail when password lacks special character or uppercase', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          'A senha deve conter pelo menos uma letra maiúscula'
        );
      }
    });

    it('should fail when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123#',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
          'As senhas não coincidem'
        );
      }
    });

    it('should fail when phone number is empty', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.phone).toContain(
          'Telefone/WhatsApp é obrigatório'
        );
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain('Formato de e-mail inválido');
      }
    });
  });
});
