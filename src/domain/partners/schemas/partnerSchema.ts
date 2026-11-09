import { z } from 'zod';
import { isBrState } from '../../../shared/utils/timeZones';
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

// Mensagens são chaves de tradução (§12.5); o formulário mostra `t(message)`.
export const step1Schema = z
  .object({
    category: z.string().min(1, 'partnerSignup.errors.categoryRequired'),
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
            ? 'partnerSignup.errors.producerNameRequired'
            : 'partnerSignup.errors.nameRequired',
      });
    }
    if (data.category !== 'producer') {
      if (!data.description || data.description.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['description'],
          message: 'partnerSignup.errors.descriptionRequired',
        });
      } else if (data.description.length > 400) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['description'],
          message: 'partnerSignup.errors.descriptionTooLong',
        });
      }
    }
  });

export const step2Schema = z
  .object({
    category: z.string().default(''),
    phone: z.string().min(1, 'partnerSignup.errors.phoneRequired'),
    phoneDdi: z.string().optional().default('+55'),
    instagram: z.string().optional().default(''),
    website: z.string().optional().default(''),
    bookingLinks: z.string().optional().default(''),
    googleMaps: z.string().optional().default(''),
    address: z.string().optional().default(''),
    region: z.string().optional().default(''),
    state: z.string().optional().default(''),
    city: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Estado e cidade dão o fuso dos horários (D28): obrigatórios em todo estabelecimento.
    if (!isBrState(data.state)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['state'],
        message: 'partnerSignup.errors.stateRequired',
      });
    }
    if (data.city.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: 'partnerSignup.errors.cityRequired',
      });
    }
    if (data.category === 'hotel' && (!data.bookingLinks || data.bookingLinks.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bookingLinks'],
        message: 'partnerSignup.errors.bookingRequired',
      });
    }
    if (data.category !== 'producer') {
      if (!data.googleMaps || data.googleMaps.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['googleMaps'],
          message: 'partnerSignup.errors.mapsRequired',
        });
      }
      if (!data.region || data.region.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['region'],
          message: 'partnerSignup.errors.regionRequired',
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
      require(Number.isFinite(hours) &&
        hours > 0, 'tourDurationHours', 'partnerSignup.errors.durationRequired');
      require(data.meetingPoint.trim() !==
        '', 'meetingPoint', 'partnerSignup.errors.meetingPointRequired');
    } else if (data.category === 'transfer') {
      require(data.transferRoutes.some(
        (route) => route.from.trim() && route.to.trim()
      ), 'transferRoutes', 'partnerSignup.errors.routesRequired');
      require(data.transferVehicles.length >
        0, 'transferVehicles', 'partnerSignup.errors.vehiclesRequired');
      require(Number.parseInt(data.maxPassengers, 10) >
        0, 'maxPassengers', 'partnerSignup.errors.capacityRequired');
    } else if (data.category === 'rental') {
      require(data.rentalVehicles.length >
        0, 'rentalVehicles', 'partnerSignup.errors.rentalWhatRequired');
      require(Number.parseInt(data.minRentalHours, 10) >
        0, 'minRentalHours', 'partnerSignup.errors.minHoursRequired');
    }
    if (data.category === 'hotel') {
      if (data.servesBreakfast === null || data.servesBreakfast === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['servesBreakfast'],
          message: 'partnerSignup.errors.breakfastRequired',
        });
      } else if (data.servesBreakfast === true) {
        if (data.breakfastIncluded === null || data.breakfastIncluded === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['breakfastIncluded'],
            message: 'partnerSignup.errors.breakfastIncludedRequired',
          });
        } else if (data.breakfastIncluded === false) {
          if (!data.breakfastPrice || data.breakfastPrice.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['breakfastPrice'],
              message: 'partnerSignup.errors.breakfastPriceRequired',
            });
          }
        }
      }
    } else if (data.category === 'restaurant') {
      if (!data.subcategory || data.subcategory.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subcategory'],
          message: 'partnerSignup.errors.subcategoryRequired',
        });
      }
    } else if (data.category === 'sight') {
      if (!data.sightAccessType || data.sightAccessType.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sightAccessType'],
          message: 'partnerSignup.errors.accessRequired',
        });
      } else if (data.sightAccessType === 'pago') {
        if (!data.sightPrice || data.sightPrice.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sightPrice'],
            message: 'partnerSignup.errors.accessPriceRequired',
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
          message: 'partnerSignup.errors.checkTimesRequired',
        });
      }
      if (data.childrenAllowed === null || data.childrenAllowed === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['childrenAllowed'],
          message: 'partnerSignup.errors.childrenRequired',
        });
      }
      if (!data.petsPolicy || data.petsPolicy.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['petsPolicy'],
          message: 'partnerSignup.errors.petsRequired',
        });
      } else if (data.petsPolicy === 'Sim' || data.petsPolicy === 'Mediante pedido') {
        if (!data.petsExtraCost || data.petsExtraCost.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['petsExtraCost'],
            message: 'partnerSignup.errors.petsCostRequired',
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
      termsAccepted: z.literal(true, { message: 'partnerSignup.errors.termsRequired' }),
    })
    .superRefine((data, ctx) => {
      if (data.category !== 'producer' && data.images.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['images'],
          message: 'partnerSignup.errors.photosRequired',
        });
      }

      if (!options.currentUser) {
        if (!data.firstName || data.firstName.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['firstName'],
            message: 'partnerSignup.errors.firstNameRequired',
          });
        }
        if (!data.email || !z.string().email().safeParse(data.email).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'partnerSignup.errors.emailInvalid',
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
            message: 'partnerSignup.errors.passwordWeak',
          });
        }
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'partnerSignup.errors.passwordMismatch',
          });
        }
      }
    });

export const partnerSubmissionSchema = z.object({
  businessName: z.string().default(''),
  category: partnerCategorySchema,
  description: z.string().optional().default(''),
  region: z.string().optional().default(''),
  state: z.string().optional().default(''),
  city: z.string().optional().default(''),
  instagram: z.string().optional().default(''),
  website: z.string().optional().default(''),
  bookingLinks: z.string().optional().default(''),
  phone: z.string().min(1, 'partnerSignup.errors.phoneRequired'),
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

export type PartnerSubmissionInput = z.infer<typeof partnerSubmissionSchema>;
export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
