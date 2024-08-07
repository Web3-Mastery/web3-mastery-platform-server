import { z } from 'zod';
import { objectIdSchema } from '../../../../globals.d.js';
export const jobSchema = z.object({
    jobTitle: z.string({
        required_error: 'jobTitle is required',
        invalid_type_error: 'jobTitle must be a string'
    }),
    companyName: z.string({
        required_error: 'companyName is required',
        invalid_type_error: 'companyName must be a string'
    }),
    companyLogo: z.string({
        // required_error: 'companyLogo is required',
        invalid_type_error: 'companyLogo must be a string'
    }),
    tags: z.array(z.string(), {
        // required_error: 'tags are required',
        invalid_type_error: 'tags must be an array of strings'
    }),
    experienceLevel: z.string({
        // required_error: 'experienceLevel is required',
        invalid_type_error: 'experienceLevel must be a string'
    }),
    jobNatureAndLocation: z.string({
        required_error: 'jobNatureAndLocation is required',
        invalid_type_error: 'jobNatureAndLocation must be a string'
    }),
    jobDescription: z.string({
        required_error: 'jobDescription is required',
        invalid_type_error: 'jobDescription must be a string'
    }),
    jobCategory: z.string({
        required_error: 'jobCategory is required',
        invalid_type_error: 'jobCategory must be a string'
    }),
    requiredSkills: z.array(z.string(), {
        // required_error: 'requiredSkills are required',
        invalid_type_error: 'requiredSkills must be an array of strings'
    }),
    timeDemand: z.string({
        required_error: 'timeDemand is required',
        invalid_type_error: 'timeDemand must be a string'
    }),
    companyWebsite: z
        .string({
        // required_error: 'companyWebsite is required',
        invalid_type_error: 'companyWebsite must be a string'
    })
        .url(),
    companyLinkedInProfile: z
        .string({
        // required_error: 'companyLinkedInProfile is required',
        invalid_type_error: 'companyLinkedInProfile must be a string'
    })
        .url(),
    companyTwitterProfile: z
        .string({
        // required_error: 'companyTwitterProfile is required',
        invalid_type_error: 'companyTwitterProfile must be a string'
    })
        .url(),
    postedBy: z.object({
        posterName: z.string({
            required_error: 'posterName is required',
            invalid_type_error: 'posterName must be a string'
        }),
        posterImage: z.string({
            required_error: 'authorImage is required',
            invalid_type_error: 'authorImage must be a string'
        }),
        posterId: objectIdSchema.optional()
    }),
    bookmarks: z.object({
        bookmarkedUsers: z.array(z.object({
            userId: z.string({
                required_error: 'bookmarkedUserId is required',
                invalid_type_error: 'bookmarkedUserId must be a string'
            })
        })),
        bookmarksCount: z.string({
            required_error: 'bookmarksCount is required',
            invalid_type_error: 'bookmarksCount must be a string'
        })
    }),
    jobLink: z
        .string({
        // required_error: 'jobLink is required',
        invalid_type_error: 'jobLink must be a string'
    })
        .optional(),
    _id: objectIdSchema.optional()
});
