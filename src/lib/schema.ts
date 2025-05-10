import { z } from "zod";

const installmentMonthsValues = [12, 24, 36] as const;

export const apartmentCalcSchema = z.object({
  apartmentBlock: z.string().min(1, "Apartment block is required."),
  floor: z.coerce.number({invalid_type_error: "Floor must be a number."}).int().positive("Floor must be a positive number."),
  apartmentNumber: z.coerce.number({invalid_type_error: "Apartment number must be a number."}).int().positive("Apartment number must be a positive number."),
  sizeSqMeters: z.coerce.number({invalid_type_error: "Size must be a number."}).positive("Size must be a positive number."),
  pricePerSqMeter: z.coerce.number({invalid_type_error: "Price must be a number."}).positive("Price per sq. meter must be a positive number."),
  downPaymentType: z.enum(["percentage", "fixed"], { required_error: "Down payment type is required."}),
  downPaymentPercentage: z.coerce.number({invalid_type_error: "Percentage must be a number."}).min(0, "Percentage cannot be negative.").max(100, "Percentage cannot exceed 100.").optional(),
  downPaymentFixed: z.coerce.number({invalid_type_error: "Amount must be a number."}).min(0, "Fixed amount cannot be negative.").optional(),
  installmentMonths: z.coerce.number().refine((val) => installmentMonthsValues.includes(val as typeof installmentMonthsValues[number]), {
    message: `Installment months must be one of: ${installmentMonthsValues.join(", ")}.`,
  }),
}).superRefine((data, ctx) => {
  if (data.downPaymentType === "percentage") {
    if (typeof data.downPaymentPercentage !== 'number' || data.downPaymentPercentage < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPaymentPercentage"],
        message: "Percentage is required and must be a non-negative number.",
      });
    }
  } else if (data.downPaymentType === "fixed") {
    if (typeof data.downPaymentFixed !== 'number' || data.downPaymentFixed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPaymentFixed"],
        message: "Fixed amount is required and must be a non-negative number.",
      });
    }
  }
});

export type ApartmentCalcFormValues = z.infer<typeof apartmentCalcSchema>;
