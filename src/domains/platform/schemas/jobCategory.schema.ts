import { z } from 'zod';

export const jobCategorySchema = z.object({
  categoryName: z.string({
    required_error: 'categoryName is required',
    invalid_type_error: 'categoryName must be a string'
  }),
  categoryId: z.string().regex(/^\d{4}$/, {
    message: 'categoryId must be a 4 digit stringed number'
    // required_error: 'categoryId is required',
    // invalid_type_error: 'categoryId must be a string'
  })
});

export type JobCategorySpecs = z.infer<typeof jobCategorySchema>;
