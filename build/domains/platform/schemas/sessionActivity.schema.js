import { z } from 'zod';
import { objectIdSchema } from '../../../../globals.d.js';
export const sessionActivitySchema = z.object({
    activityName: z.string({
        required_error: 'activityName is required',
        invalid_type_error: 'activityName must be a string'
    }),
    activityDescription: z.string({
        required_error: 'activityDescription is required',
        invalid_type_error: 'activityDescription must be a string'
    }),
    activityId: z
        .string({
        required_error: 'activityId is required',
        invalid_type_error: 'activityId must be a string'
    })
        .optional(),
    contentActivityData: z
        .object({
        contentType: z.string({
            required_error: 'contentType must be stated',
            invalid_type_error: 'contentType must be a string'
        }),
        contentTitle: z.string({
            required_error: 'contentTitle must be stated',
            invalid_type_error: 'contentTitle must be a string'
        }),
        contentId: objectIdSchema.optional(),
        contentUrl: z.string({
            required_error: 'contentUrl must be stated',
            invalid_type_error: 'contentUrl must be a string'
        })
    })
        .optional(),
    jobActivityData: z
        .object({
        jobTitle: z.string({
            required_error: 'jobTitle must be stated',
            invalid_type_error: 'jobTitle must be a string'
        }),
        jobCategory: z.string({
            required_error: 'jobCategory must be stated',
            invalid_type_error: 'jobCategory must be a string'
        }),
        jobId: objectIdSchema,
        jobUrl: z.string({
            required_error: 'jobUrl must be stated',
            invalid_type_error: 'jobUrl must be a string'
        })
    })
        .optional(),
    _id: objectIdSchema.optional()
});
