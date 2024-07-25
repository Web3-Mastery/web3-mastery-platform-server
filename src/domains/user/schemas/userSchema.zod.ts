import { z } from 'zod';
import { jobSchema } from '../../jobs/schemas/jobSchema.zod.js';
import { postSchema } from '../../posts/schemas/postSchema.zod.js';
import { sessionActivitySchema } from '../../platform/schemas/sessionActivity.schema.js';

export const userSchema = z.object({
  name: z
    .string({
      // required_error: 'name is required',
      invalid_type_error: 'name must be a string'
    })
    .optional(),
  email: z
    .string({
      // required_error: 'email is required',
      invalid_type_error: 'email must be a string and in a valid email format'
    })
    .email()
    .optional(),
  bio: z
    .string({
      // required_error: 'bio is required',
      invalid_type_error: 'bio must be a string'
    })
    .optional(),
  password: z
    .string({
      // required_error: 'password is required',
      invalid_type_error: 'password must be a string'
    })
    .optional(),
  confirmPassword: z
    .string({
      // required_error: 'confirmPassword is required',
      invalid_type_error: 'confirmPassword must be a string'
    })
    .optional(),
  website: z
    .string({
      // required_error: 'website is required',
      invalid_type_error: 'website must be a string'
    })
    .url()
    .optional(),
  linkedInProfile: z
    .string({
      // required_error: 'linkedInProfile is required',
      invalid_type_error: 'linkedInProfile must be a string'
    })
    .url()
    .optional(),
  githubProfile: z
    .string({
      // required_error: 'gitHubProfile is required',
      invalid_type_error: 'gitHubProfile must be a string'
    })
    .url()
    .optional(),
  twitterProfile: z
    .string({
      // required_error: 'twitterProfile is required',
      invalid_type_error: 'twitterProfile must be a string'
    })
    .url()
    .optional(),
  youtubeProfile: z
    .string({
      // required_error: 'youTubeProfile is required',
      invalid_type_error: 'youTubeProfile must be a string'
    })
    .url()
    .optional(),
  resume: z
    .string({
      // required_error: 'resume is required',
      invalid_type_error: 'resume URL must be a string'
    })
    .optional(),
  communityRank: z
    .string({
      // required_error: 'communityRank is required',
      invalid_type_error: 'communityRank must be a string'
    })
    .optional(),
  walletAddress: z
    .string({
      // required_error: 'walletAddress is required',
      invalid_type_error: 'walletAddress must be a string'
    })
    .optional(),
  isRecruiterEnabled: z
    .boolean({
      // required_error: 'isRecruiterEnabled is required',
      invalid_type_error: 'isRecruiterEnabled must be a boolean type'
    })
    .optional(),
  savedJobs: z.array(jobSchema).optional(),
  bookMarks: z.array(postSchema).optional(),
  skills: z
    .array(z.string(), {
      // required_error: 'skills are required',
      invalid_type_error: 'skills must be an array of strings'
    })
    .optional(),
  education: z
    .array(
      z.object({
        institution: z.string({
          required_error: 'institution is required',
          invalid_type_error: 'institution must be a string'
        }),
        degree: z.string({
          required_error: 'degree is required',
          invalid_type_error: 'degree must be a string'
        }),
        startYear: z.string({
          required_error: 'start year is required',
          invalid_type_error: 'start year must be a string'
        }),
        endYear: z
          .string({
            // required_error: 'end year is required',
            invalid_type_error: 'end year must be a string'
          })
          .optional()
      }),
      {
        // required_error: 'education is required',
        invalid_type_error: 'education must be an array of objects'
      }
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string({
          required_error: 'company is required',
          invalid_type_error: 'company must be a string'
        }),
        position: z.string({
          required_error: 'position is required',
          invalid_type_error: 'position must be a string'
        }),
        achievements: z.string({
          required_error: 'achievements is required',
          invalid_type_error: 'achievements must be a string'
        }),
        startYear: z.string({
          required_error: 'start year is required',
          invalid_type_error: 'start year must be a string'
        }),
        endYear: z
          .string({
            // required_error: 'end year is required',
            invalid_type_error: 'end year must be a string'
          })
          .optional()
      }),
      {
        // required_error: 'experience is required',
        invalid_type_error: 'experience must be an array of objects'
      }
    )
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
  _id: z.string().optional(),
  accessToken: z
    .string({
      // required_error: 'accessToken is required',
      invalid_type_error: 'accessToken must be a string'
    })
    .optional(),
  oneTimePassword: z.string().optional(),
  oneTimePasswordToken: z.string().optional(),
  secretSignUpToken: z.string().optional(),
  signUpStatus: z.string().optional()
});

export type UserSpecs = z.infer<typeof userSchema>;
