import { z } from 'zod';
import { passwordSchema, type ResetPasswordFormData, resetPasswordSchema } from './passwordSchema';

export { passwordSchema, resetPasswordSchema };
export type { ResetPasswordFormData };

// Mensagens são chaves de tradução (AGENTS.md §12.5): a tela mostra `t(message)`.
const email = z
  .string()
  .min(1, 'auth.validation.emailRequired')
  .email('auth.validation.emailInvalid');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'auth.validation.passwordRequired'),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'auth.validation.firstNameRequired')
      .max(100, 'auth.validation.firstNameTooLong'),
    lastName: z
      .string()
      .min(1, 'auth.validation.lastNameRequired')
      .max(100, 'auth.validation.lastNameTooLong'),
    email,
    countryCode: z.string(),
    phone: z.string().min(1, 'auth.validation.phoneRequired'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'auth.validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.mismatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
