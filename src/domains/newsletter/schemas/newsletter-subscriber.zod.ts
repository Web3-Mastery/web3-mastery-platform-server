import { z } from 'zod';

export const newsletterSubscriberSchema = z.object({
  email: z.string({
    required_error: 'subscriber email is required',
    invalid_type_error: 'email must be a string and in the valid email format'
  }),
  _id: z.string().optional()
});

export type NewsletterSubscriberSpecs = z.infer<typeof newsletterSubscriberSchema>;
