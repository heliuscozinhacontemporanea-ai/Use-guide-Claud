import { describe, it, expect } from 'vitest';
import { checkPasswordRequirements } from './passwordRequirements';

describe('checkPasswordRequirements', () => {
  it('identifies uppercase letter correctly', () => {
    expect(checkPasswordRequirements('lowercase').hasUppercase).toBe(false);
    expect(checkPasswordRequirements('Uppercase').hasUppercase).toBe(true);
  });

  it('identifies lowercase letter correctly', () => {
    expect(checkPasswordRequirements('UPPERCASE').hasLowercase).toBe(false);
    expect(checkPasswordRequirements('UPPERCASe').hasLowercase).toBe(true);
  });

  it('identifies numbers correctly', () => {
    expect(checkPasswordRequirements('NoNumbers').hasNumber).toBe(false);
    expect(checkPasswordRequirements('With1Number').hasNumber).toBe(true);
  });

  it('identifies special characters correctly', () => {
    expect(checkPasswordRequirements('NoSpecial123').hasSpecial).toBe(false);
    expect(checkPasswordRequirements('With@Special').hasSpecial).toBe(true);
  });

  it('identifies minimum length correctly', () => {
    expect(checkPasswordRequirements('Short1!').hasMinLength).toBe(false);
    expect(checkPasswordRequirements('Eight12!').hasMinLength).toBe(true);
  });

  it('returns all true for strong password', () => {
    const result = checkPasswordRequirements('StrongP@ss1');
    expect(result).toEqual({
      hasUppercase: true,
      hasLowercase: true,
      hasNumber: true,
      hasSpecial: true,
      hasMinLength: true,
    });
  });
});
