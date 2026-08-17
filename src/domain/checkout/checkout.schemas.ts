import { z } from "zod";
import { GOVERNORATE_VALUES } from "@/fixtures/tunisia-governorates.fixture";
import {
  TUNISIAN_PHONE_ERROR,
  isValidTunisianPhone,
  normalizeTunisianPhone,
} from "@/services/checkout/phone-normalization";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(2, { message: `${label} doit contenir au moins 2 caractères.` })
    .max(60, { message: `${label} ne doit pas dépasser 60 caractères.` });

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { message: `${label} ne doit pas dépasser ${max} caractères.` })
    .optional()
    .or(z.literal(""));

export const checkoutCustomerSchema = z.object({
  firstName: nameSchema("Le prénom"),
  lastName: nameSchema("Le nom"),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Le téléphone est obligatoire." })
    .refine(isValidTunisianPhone, { message: TUNISIAN_PHONE_ERROR })
    .transform(normalizeTunisianPhone),
  email: z
    .string()
    .trim()
    .max(255, { message: "L'e-mail ne doit pas dépasser 255 caractères." })
    .email({ message: "Saisissez une adresse e-mail valide." })
    .optional()
    .or(z.literal("")),
});

export const checkoutAddressSchema = z.object({
  governorate: z
    .string()
    .trim()
    .refine((value) => GOVERNORATE_VALUES.includes(value as never), {
      message: "Sélectionnez un gouvernorat.",
    }),
  city: z
    .string()
    .trim()
    .min(2, { message: "Indiquez votre ville ou délégation." })
    .max(80, { message: "La ville ne doit pas dépasser 80 caractères." }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, { message: "Le code postal comporte 4 chiffres." })
    .optional()
    .or(z.literal("")),
  addressLine: z
    .string()
    .trim()
    .min(5, { message: "Indiquez votre adresse complète." })
    .max(200, { message: "L'adresse ne doit pas dépasser 200 caractères." }),
  landmark: optionalText(120, "Le point de repère"),
  deliveryNote: optionalText(300, "La note au livreur"),
});

export const deliveryMethodSchema = z.enum(["home_delivery", "store_pickup"]);
export const paymentMethodSchema = z.enum(["cash_on_delivery"]);

export const checkoutFormSchema = z
  .object({
    customer: checkoutCustomerSchema,
    deliveryMethod: deliveryMethodSchema,
    shippingAddress: checkoutAddressSchema.partial().optional(),
    paymentMethod: paymentMethodSchema,
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions générales de vente." }),
    }),
  })
  .superRefine((values, ctx) => {
    if (values.deliveryMethod !== "home_delivery") return;
    const parsed = checkoutAddressSchema.safeParse(values.shippingAddress ?? {});
    if (parsed.success) return;
    for (const issue of parsed.error.issues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shippingAddress", ...issue.path],
        message: issue.message,
      });
    }
  });

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormOutput = z.output<typeof checkoutFormSchema>;
