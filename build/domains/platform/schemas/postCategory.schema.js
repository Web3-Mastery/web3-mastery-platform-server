import { z } from 'zod';
export const postCategorySchema = z.object({
    categoryName: z.string({
        required_error: 'categoryName is required',
        invalid_type_error: 'categoryName must be a string'
    }),
    categoryId: z.string().regex(/^\d{4}$/, {
        message: 'categoryId must be a 4 digit stringed number'
        // required_error: 'categoryId is required',
        // invalid_type_error: 'categoryId must be a string'
    }),
    categoryContentType: z.string({
        required_error: 'categoryContentType is required',
        invalid_type_error: 'categoryContentType must be a string'
    })
});
