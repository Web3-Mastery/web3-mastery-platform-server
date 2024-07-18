import { z } from 'zod';
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
        posterId: z.string({
            required_error: 'posterId is required',
            invalid_type_error: 'posterId must be a string'
        })
    })
});
