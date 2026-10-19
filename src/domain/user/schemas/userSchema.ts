import { z } from 'zod';
import { checkPasswordRequirements } from '../../auth';
import { SUPPORTED_LOCALES } from '../../../shared/i18n';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres'),
  phone: z.string().max(20, 'Telefone inválido'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const preferredLocaleSchema = z.enum(SUPPORTED_LOCALES);

export const updatePasswordSchema = z
  .object({
    current: z.string().min(1, 'Senha atual é obrigatória'),
    new: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .max(20, 'A senha deve ter no máximo 20 caracteres')
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
      ),
    confirm: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.new === data.confirm, {
    message: 'As novas senhas não coincidem',
    path: ['confirm'],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória para confirmação'),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
