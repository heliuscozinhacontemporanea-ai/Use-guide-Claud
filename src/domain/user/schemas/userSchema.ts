import { z } from 'zod';
import { checkPasswordRequirements } from '../../auth';
import { SUPPORTED_LOCALES } from '../../../shared/i18n';

// Mensagens são chaves de tradução; o formulário mostra `t(error.message)` (AGENTS.md §12.5).

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'account.validation.firstNameRequired')
    .max(50, 'account.validation.firstNameTooLong'),
  lastName: z
    .string()
    .min(1, 'account.validation.lastNameRequired')
    .max(50, 'account.validation.lastNameTooLong'),
  phone: z.string().max(20, 'account.validation.phoneInvalid'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const preferredLocaleSchema = z.enum(SUPPORTED_LOCALES);

export const updatePasswordSchema = z
  .object({
    current: z.string().min(1, 'account.validation.currentRequired'),
    new: z
      .string()
      .min(8, 'account.validation.newRules')
      .max(20, 'account.validation.newRules')
      .refine((val) => checkPasswordRequirements(val).hasUppercase, 'account.validation.newRules')
      .refine((val) => checkPasswordRequirements(val).hasLowercase, 'account.validation.newRules')
      .refine((val) => checkPasswordRequirements(val).hasNumber, 'account.validation.newRules'),
    confirm: z.string().min(1, 'account.validation.confirmRequired'),
  })
  .refine((data) => data.new === data.confirm, {
    message: 'account.validation.mismatch',
    path: ['confirm'],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'account.validation.passwordRequired'),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
