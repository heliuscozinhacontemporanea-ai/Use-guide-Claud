import { z } from 'zod';
import { checkPasswordRequirements } from '../utils/passwordRequirements';

// Mensagens são chaves de tradução (AGENTS.md §12.5): a tela mostra `t(message)`.
export const passwordSchema = z
  .string()
  .min(8, 'auth.validation.passwordMin')
  .max(100, 'auth.validation.passwordMax')
  .refine((val) => checkPasswordRequirements(val).hasUppercase, 'auth.validation.passwordUpper')
  .refine((val) => checkPasswordRequirements(val).hasLowercase, 'auth.validation.passwordLower')
  .refine((val) => checkPasswordRequirements(val).hasNumber, 'auth.validation.passwordNumber')
  .refine((val) => checkPasswordRequirements(val).hasSpecial, 'auth.validation.passwordSpecial');

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'auth.validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.mismatch',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
