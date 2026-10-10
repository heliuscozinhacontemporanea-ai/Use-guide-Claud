import { describe, it, expect } from 'vitest';
import { passwordSchema, resetPasswordSchema } from './passwordSchema';

describe('passwordSchema', () => {
  it('accepts valid strong passwords', () => {
    const validPasswords = ['StrongP@ss1', 'Abcdef1!', 'Passw0rd#Secure', 'Mypass_1234'];

    validPasswords.forEach((pw) => {
      const result = passwordSchema.safeParse(pw);
      expect(result.success).toBe(true);
    });
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Sh0rt!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/pelo menos 8 caracteres/i);
    }
  });

  it('rejects passwords without uppercase letters', () => {
    const result = passwordSchema.safeParse('weakpass1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/letra maiúscula/i);
    }
  });

  it('rejects passwords without lowercase letters', () => {
    const result = passwordSchema.safeParse('WEAKPASS1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/letra minúscula/i);
    }
  });

  it('rejects passwords without numbers', () => {
    const result = passwordSchema.safeParse('WeakPassword!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/número/i);
    }
  });

  it('rejects passwords without special characters', () => {
    const result = passwordSchema.safeParse('WeakPassword1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/caractere especial/i);
    }
  });
});

describe('resetPasswordSchema', () => {
  it('validates matching passwords successfully', () => {
    const validData = {
      password: 'StrongP@ssword1',
      confirmPassword: 'StrongP@ssword1',
    };

    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const invalidData = {
      password: 'StrongP@ssword1',
      confirmPassword: 'DifferentP@ssword1',
    };

    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(issue?.message).toMatch(/senhas não coincidem/i);
    }
  });
});
