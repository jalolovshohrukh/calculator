import { z } from "zod";

const installmentMonthsValues = [12, 24, 36] as const;

export const apartmentCalcSchema = z.object({
  apartmentBlock: z.string().min(1, "Kvartira bloki majburiy."),
  floor: z.coerce.number({invalid_type_error: "Qavat raqam bo'lishi kerak."}).int().positive("Qavat musbat son bo'lishi kerak."),
  apartmentNumber: z.coerce.number({invalid_type_error: "Kvartira raqami son bo'lishi kerak."}).int().positive("Kvartira raqami musbat son bo'lishi kerak."),
  sizeSqMeters: z.coerce.number({invalid_type_error: "Hajmi raqam bo'lishi kerak."}).positive("Hajmi musbat son bo'lishi kerak."),
  pricePerSqMeter: z.coerce.number({invalid_type_error: "Narx raqam bo'lishi kerak."}).positive("Bir kvadrat metr narxi musbat son bo'lishi kerak."),
  numberOfRooms: z.coerce.number({invalid_type_error: "Xonalar soni raqam bo'lishi kerak."}).int().positive("Xonalar soni musbat son bo'lishi kerak."),
  downPaymentType: z.enum(["percentage", "fixed"], { required_error: "Boshlang'ich to'lov turi majburiy."}),
  downPaymentPercentage: z.coerce.number({invalid_type_error: "Foiz raqam bo'lishi kerak."}).min(0, "Foiz manfiy bo'lishi mumkin emas.").max(100, "Foiz 100 dan oshmasligi kerak.").optional(),
  downPaymentFixed: z.coerce.number({invalid_type_error: "Miqdor raqam bo'lishi kerak."}).min(0, "Belgilangan miqdor manfiy bo'lishi mumkin emas.").optional(),
  installmentMonths: z.coerce.number().refine((val) => installmentMonthsValues.includes(val as typeof installmentMonthsValues[number]), {
    message: `Bo'lib to'lash oylari quyidagilardan biri bo'lishi kerak: ${installmentMonthsValues.join(", ")}.`,
  }),
}).superRefine((data, ctx) => {
  if (data.downPaymentType === "percentage") {
    if (typeof data.downPaymentPercentage !== 'number' || data.downPaymentPercentage < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPaymentPercentage"],
        message: "Foiz majburiy va manfiy bo'lmagan raqam bo'lishi kerak.",
      });
    }
  } else if (data.downPaymentType === "fixed") {
    if (typeof data.downPaymentFixed !== 'number' || data.downPaymentFixed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPaymentFixed"],
        message: "Belgilangan miqdor majburiy va manfiy bo'lmagan raqam bo'lishi kerak.",
      });
    }
  }
});

export type ApartmentCalcFormValues = z.infer<typeof apartmentCalcSchema>;
