import { z } from 'zod';
import type { UserSession } from '../../auth';

// Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos.
const partnerCategorySchema = z.enum([
  'sight',
  'hotel',
  'restaurant',
  'tour',
  'transfer',
  'rental',
  'producer',
]);

export const step1Schema = z
  .object({
    category: z.string().min(1, 'Selecione uma categoria'),
    businessName: z.string().default(''),
    description: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.businessName || data.businessName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessName'],
        message:
          data.category === 'producer'
            ? 'Nome do produtor é obrigatório'
            : 'Nome do estabelecimento é obrigatório',
      });
    }
    if (data.category !== 'producer') {
      if (!data.description || data.description.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['description'],
          message: 'Descrição é obrigatória',
        });
      } else if (data.description.length > 400) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['description'],
          message: 'A descrição não pode ter mais de 400 caracteres',
        });
      }
    }
  });

export const step2Schema = z
  .object({
    category: z.string().default(''),
    phone: z.string().min(1, 'Telefone/WhatsApp é obrigatório'),
    phoneDdi: z.string().optional().default('+55'),
    instagram: z.string().optional().default(''),
    website: z.string().optional().default(''),
    bookingLinks: z.string().optional().default(''),
    googleMaps: z.string().optional().default(''),
    address: z.string().optional().default(''),
    region: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'hotel' && (!data.bookingLinks || data.bookingLinks.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bookingLinks'],
        message: 'Link para reserva é obrigatório',
      });
    }
    if (data.category !== 'producer') {
      if (!data.googleMaps || data.googleMaps.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['googleMaps'],
          message: 'Link do Google Maps é obrigatório',
        });
      }
      if (!data.region || data.region.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['region'],
          message: 'Região é obrigatória',
        });
      }
    }
  });

export const step3Schema = z
  .object({
    category: z.string().default(''),
    servesBreakfast: z.boolean().nullable().optional(),
    breakfastIncluded: z.boolean().nullable().optional(),
    breakfastPrice: z.string().optional().default(''),
    breakfastTypes: z.array(z.string()).optional().default([]),
    amenities: z.array(z.string()).optional().default([]),
    subcategory: z.string().optional().default(''),
    cuisineType: z.string().optional().default(''),
    mealTypes: z.array(z.string()).optional().default([]),
    additionalServices: z.array(z.string()).optional().default([]),
    amenitiesRestaurant: z.array(z.string()).optional().default([]),
    menuLink: z.string().optional().default(''),
    sightAccessType: z.string().optional().default(''),
    sightPrice: z.string().optional().default(''),
    sightServices: z.array(z.string()).optional().default([]),
    sightAmenities: z.array(z.string()).optional().default([]),
    sightActivities: z.array(z.string()).optional().default([]),
    tourDurationHours: z.string().optional().default(''),
    meetingPoint: z.string().optional().default(''),
    transferRoutes: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .optional()
      .default([]),
    transferVehicles: z.array(z.string()).optional().default([]),
    maxPassengers: z.string().optional().default(''),
    rentalVehicles: z.array(z.string()).optional().default([]),
    minRentalHours: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const require = (ok: boolean, path: string, message: string) => {
      if (!ok) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    };
    if (data.category === 'tour') {
      const hours = Number(data.tourDurationHours.replace(',', '.'));
      require(Number.isFinite(hours) && hours > 0, 'tourDurationHours', 'Informe a duração');
      require(data.meetingPoint.trim() !== '', 'meetingPoint', 'Informe o ponto de encontro');
    } else if (data.category === 'transfer') {
      require(data.transferRoutes.some(
        (route) => route.from.trim() && route.to.trim()
      ), 'transferRoutes', 'Informe ao menos um trecho com origem e destino');
      require(data.transferVehicles.length > 0, 'transferVehicles', 'Escolha ao menos um veículo');
      require(Number.parseInt(data.maxPassengers, 10) > 0, 'maxPassengers', 'Informe a capacidade');
    } else if (data.category === 'rental') {
      require(data.rentalVehicles.length > 0, 'rentalVehicles', 'Escolha o que é alugado');
      require(Number.parseInt(data.minRentalHours, 10) >
        0, 'minRentalHours', 'Informe o período mínimo');
    }
    if (data.category === 'hotel') {
      if (data.servesBreakfast === null || data.servesBreakfast === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['servesBreakfast'],
          message: 'Informe se serve café da manhã',
        });
      } else if (data.servesBreakfast === true) {
        if (data.breakfastIncluded === null || data.breakfastIncluded === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['breakfastIncluded'],
            message: 'Informe se o café está incluso',
          });
        } else if (data.breakfastIncluded === false) {
          if (!data.breakfastPrice || data.breakfastPrice.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['breakfastPrice'],
              message: 'Informe o preço do café da manhã',
            });
          }
        }
      }
    } else if (data.category === 'restaurant') {
      if (!data.subcategory || data.subcategory.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subcategory'],
          message: 'Subcategoria é obrigatória',
        });
      }
    } else if (data.category === 'sight') {
      if (!data.sightAccessType || data.sightAccessType.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sightAccessType'],
          message: 'Informe o tipo de acesso',
        });
      } else if (data.sightAccessType === 'pago') {
        if (!data.sightPrice || data.sightPrice.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sightPrice'],
            message: 'Informe o valor de acesso',
          });
        }
      }
    }
  });

export const step4Schema = z
  .object({
    category: z.string().default(''),
    languages: z.array(z.string()).optional().default([]),
    checkInFrom: z.string().optional().default(''),
    checkInTo: z.string().optional().default(''),
    checkOutFrom: z.string().optional().default(''),
    checkOutTo: z.string().optional().default(''),
    childrenAllowed: z.boolean().nullable().optional(),
    petsPolicy: z.string().optional().default(''),
    petsExtraCost: z.string().optional().default(''),
    operatingHours: z
      .record(
        z.string(),
        z.object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'hotel') {
      if (!data.checkInFrom || !data.checkInTo || !data.checkOutFrom || !data.checkOutTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['checkInFrom'],
          message: 'Informe os horários de check-in e check-out',
        });
      }
      if (data.childrenAllowed === null || data.childrenAllowed === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['childrenAllowed'],
          message: 'Informe se aceita crianças',
        });
      }
      if (!data.petsPolicy || data.petsPolicy.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['petsPolicy'],
          message: 'Informe a política para pets',
        });
      } else if (data.petsPolicy === 'Sim' || data.petsPolicy === 'Mediante pedido') {
        if (!data.petsExtraCost || data.petsExtraCost.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['petsExtraCost'],
            message: 'Informe se há custo extra para pets',
          });
        }
      }
    }
  });

export const step5SchemaContext = (options: { currentUser?: UserSession | null }) =>
  z
    .object({
      category: z.string().default(''),
      images: z.array(z.any()).default([]),
      firstName: z.string().optional().default(''),
      lastName: z.string().optional().default(''),
      email: z.string().optional().default(''),
      password: z.string().optional().default(''),
      confirmPassword: z.string().optional().default(''),
      termsAccepted: z.literal(true),
    })
    .superRefine((data, ctx) => {
      if (data.category !== 'producer' && data.images.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['images'],
          message: 'Selecione pelo menos uma foto do estabelecimento',
        });
      }

      if (!options.currentUser) {
        if (!data.firstName || data.firstName.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['firstName'],
            message: 'Nome é obrigatório',
          });
        }
        if (!data.email || !z.string().email().safeParse(data.email).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'E-mail é obrigatório e deve ser válido',
          });
        }
        const pass = data.password || '';
        const hasLength = pass.length >= 8 && pass.length <= 20;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNum = /\d/.test(pass);
        if (!hasLength || !hasUpper || !hasLower || !hasNum) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['password'],
            message:
              'A senha deve ter entre 8 e 20 caracteres, com letras maiúsculas, minúsculas e números.',
          });
        }
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'As senhas não coincidem',
          });
        }
      }
    });

export const partnerSubmissionSchema = z.object({
  businessName: z.string().default(''),
  category: partnerCategorySchema,
  description: z.string().optional().default(''),
  region: z.string().optional().default(''),
  instagram: z.string().optional().default(''),
  website: z.string().optional().default(''),
  bookingLinks: z.string().optional().default(''),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  phoneDdi: z.string().optional().default('+55'),
  googleMaps: z.string().optional().default(''),
  address: z.string().optional().default(''),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  password: z.string().optional().default(''),
  confirmPassword: z.string().optional().default(''),
  childrenAllowed: z.boolean().nullable().optional(),
  petsPolicy: z.string().optional().default(''),
  petsExtraCost: z.string().optional().default(''),
  checkInFrom: z.string().optional().default(''),
  checkInTo: z.string().optional().default(''),
  checkOutFrom: z.string().optional().default(''),
  checkOutTo: z.string().optional().default(''),
  languages: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  servesBreakfast: z.boolean().nullable().optional(),
  breakfastIncluded: z.boolean().nullable().optional(),
  breakfastPrice: z.string().optional().default(''),
  breakfastTypes: z.array(z.string()).optional().default([]),
  subcategory: z.string().optional().default(''),
  cuisineType: z.string().optional().default(''),
  mealTypes: z.array(z.string()).optional().default([]),
  additionalServices: z.array(z.string()).optional().default([]),
  amenitiesRestaurant: z.array(z.string()).optional().default([]),
  operatingHours: z
    .record(
      z.string(),
      z.object({
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    )
    .optional(),
  menuLink: z.string().optional().default(''),
  sightActivities: z.array(z.string()).optional().default([]),
  sightServices: z.array(z.string()).optional().default([]),
  sightAmenities: z.array(z.string()).optional().default([]),
  sightAccessType: z.string().optional().default(''),
  sightPrice: z.string().optional().default(''),
  photosLink: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),
  images: z.array(z.any()).optional().default([]),
  termsAccepted: z.literal(true),
});

export const partnerIdSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
});

export const updatePartnerStatusSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
  status: z.enum(['active', 'suspended']),
});

export const updatePartnerVerificationSchema = z
  .object({
    partnerId: z.string().min(1),
    isVerified: z.boolean(),
  })
  .strict();

export type PartnerSubmissionInput = z.infer<typeof partnerSubmissionSchema>;
export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
export type UpdatePartnerVerificationInput = z.infer<typeof updatePartnerVerificationSchema>;
