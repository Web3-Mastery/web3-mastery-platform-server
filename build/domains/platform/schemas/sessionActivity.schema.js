import { z } from 'zod';
export const sessionActivitySchema = z.object({
    activityName: z.string({
        required_error: 'activityName is required',
        invalid_type_error: 'activityName must be a string'
    }),
    activityDescription: z.string({
        required_error: 'activityDescription is required',
        invalid_type_error: 'activityDescription must be a string'
    }),
    activityId: z.string({
        required_error: ' activityId must be stated',
        invalid_type_error: ' activityId must be a string'
    }),
    _id: z.string().optional()
});
