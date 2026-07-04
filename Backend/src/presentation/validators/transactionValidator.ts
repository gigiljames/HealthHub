import { z } from "zod";
import { TransactionDirection } from "../../domain/enums/transactionDirection";
import { TransactionType } from "../../domain/enums/transactionType";
import { TransactionSource } from "../../domain/enums/transactionSource";
import { PaymentStatus } from "../../domain/enums/paymentStatus";

const emptyStringToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const getTransactionsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.preprocess(emptyStringToUndefined, z.string().optional()),
  source: z.preprocess(
    emptyStringToUndefined,
    z.enum(TransactionSource).optional(),
  ),
  type: z.preprocess(
    emptyStringToUndefined,
    z.enum(TransactionType).optional(),
  ),
  direction: z.preprocess(
    emptyStringToUndefined,
    z.enum(TransactionDirection).optional(),
  ),
  status: z.preprocess(
    emptyStringToUndefined,
    z.enum(PaymentStatus).optional(),
  ),
  role: z.preprocess(emptyStringToUndefined, z.string().optional()),
  minAmount: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
  ),
  maxAmount: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
  ),
  startDate: z.preprocess(emptyStringToUndefined, z.string().optional()),
  endDate: z.preprocess(emptyStringToUndefined, z.string().optional()),
});
