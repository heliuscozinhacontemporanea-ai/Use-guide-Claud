import { z } from 'zod';
import { checkPasswordRequirements } from '../utils/passwordRequirements';

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(100, 'A senha deve ter no máximo 100 caracteres')
  .refine(
    (val) => checkPasswordRequirements(val).hasUppercase,
    'A senha deve conter pelo menos uma letra maiúscula'
  )
  .refine(
    (val) => checkPasswordRequirements(val).hasLowercase,
    'A senha deve conter pelo menos uma letra minúscula'
  )
  .refine(
    (val) => checkPasswordRequirements(val).hasNumber,
    'A senha deve conter pelo menos um número'
  )
  .refine(
    (val) => checkPasswordRequirements(val).hasSpecial,
    'A senha deve conter pelo menos um caractere especial'
  );

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
