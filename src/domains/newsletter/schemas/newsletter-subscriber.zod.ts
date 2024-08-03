import { z } from 'zod';
import { objectIdSchema } from '../../../../globals.d.js';
import { sessionActivitySchema } from '../../platform/schemas/sessionActivity.schema.js';

export const newsletterSubscriberSchema = z.object({
  email: z.string({
    required_error: 'subscriber email is required',
    invalid_type_error: 'email must be a string and in the valid email format'
  }),
  isPlatformUser: z
    .boolean({
      // required_error: 'isCommunityMember is required',
      invalid_type_error: 'isNewsletterSubscriber must be a boolean type'
    })
    .optional(),
  isVerified: z
    .boolean({
      // required_error: 'isCommunityMember is required',
      invalid_type_error: 'isVerified must be a boolean type'
    })
    .optional(),
  subscriptionToken: z
    .string({
      required_error: '  subscriptionToken is required',
      invalid_type_error: '  subscriptionToken must be a string'
    })
    .optional(),
  sessions: z
    .array(
      z.array(
        z.object({
          userIPAddress: z
            .string({
              // required_error: 'userIPAddress is required',
              invalid_type_error: 'userIPAddress must be a string'
            })
            .optional(),
          userLocation: z
            .string({
              // required_error: 'userLocation is required',
              invalid_type_error: 'userLocation must be a string'
            })
            .optional(),
          userDeviceData: z
            .array(z.record(z.string(), z.any()), {
              // required_error: 'userDevice data is required',
              invalid_type_error: 'userDevice data must be an array'
            })
            .optional(),
          subSessionActivity: sessionActivitySchema.optional(),
          checkInTime: z
            .string({
              // required_error: 'checkInTime is required',
              invalid_type_error: 'checkInTime must be a string'
            })
            .optional(),
          sessionId: z
            .string({
              // required_error: 'sessionId is required',
              invalid_type_error: 'sessionId must be a string'
            })
            .optional()
        }),
        {
          // required_error: 'subSession data is required',
          invalid_type_error: 'subSession data must be an array of objects'
        }
      ),
      {
        // required_error: 'Session data is required',
        invalid_type_error: 'Session data must be an array containing subSessionArrays'
      }
    )
    .optional(),
  platformUserId: objectIdSchema.optional(),
  _id: objectIdSchema.optional()
});

export type NewsletterSubscriberSpecs = z.infer<typeof newsletterSubscriberSchema>;
