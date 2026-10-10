import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerUserSchema = z
  .object({
    firstName: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    lastName: z.string().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
    email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
    countryCode: z.string().optional().default('+55'),
    phone: z.string().min(1, 'Telefone/WhatsApp é obrigatório'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .refine((val) => /[A-Z]/.test(val), 'A senha deve conter pelo menos uma letra maiúscula')
      .refine((val) => /[0-9]/.test(val), 'A senha deve conter pelo menos um número')
      .refine(
        (val) => /[#-@/]/.test(val),
        'A senha deve conter pelo menos um caractere especial (#, -, @, /)'
      ),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória').optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
});

export const updateUserProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(50, 'Nome deve ter no máximo 50 caracteres'),
    lastName: z
      .string()
      .min(1, 'Sobrenome é obrigatório')
      .max(50, 'Sobrenome deve ter no máximo 50 caracteres'),
    phone: z.string().max(20, 'Telefone inválido').optional().default(''),
  })
  .strict();

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PROFILE_PHOTO_BASE64_LENGTH = Math.ceil(MAX_PROFILE_PHOTO_BYTES / 3) * 4 + 256;

export const uploadUserPhotoSchema = z.object({
  photoBase64: z
    .string()
    .min(1, 'Imagem é obrigatória')
    .max(MAX_PROFILE_PHOTO_BASE64_LENGTH, 'Imagem excede o tamanho máximo permitido'),
  mimeType: z
    .enum(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
    .optional()
    .default('image/jpeg'),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UploadUserPhotoInput = z.infer<typeof uploadUserPhotoSchema>;
