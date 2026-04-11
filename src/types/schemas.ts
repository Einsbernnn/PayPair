import { z } from 'zod';

export const ExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paid_by: z.string().uuid('Invalid payer'),
  category: z.enum(['food', 'transport', 'accommodation', 'other']).default('other'),
  session_id: z.string().uuid(),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;
