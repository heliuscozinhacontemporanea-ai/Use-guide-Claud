import { z } from 'zod';
import { passwordSchema, resetPasswordSchema, ResetPasswordFormData } from './passwordSchema';

export { passwordSchema, resetPasswordSchema };
export type { ResetPasswordFormData };

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    lastName: z.string().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
    email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
    countryCode: z.string(),
    phone: z.string().min(1, 'Telefone/WhatsApp é obrigatório'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
