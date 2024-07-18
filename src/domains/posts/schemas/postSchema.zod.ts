import { z } from 'zod';

export const postSchema = z.object({
  postTitle: z.string({
    required_error: 'postTitle is required',
    invalid_type_error: 'postTitle must be a string'
  }),
  postSummary: z.string({
    required_error: 'postSummary is required',
    invalid_type_error: 'postSummary must be a string'
  }),
  postBanner: z.string({
    required_error: 'postBanner is required',
    invalid_type_error: 'postBanner must be a string'
  }),
  postedBy: z.object({
    authorImage: z.string({
      required_error: 'authorImage is required',
      invalid_type_error: 'authorImage must be a string'
    }),
    authorName: z.string({
      required_error: 'authorName is required',
      invalid_type_error: 'authorName must be a string'
    }),
    authorId: z.string({
      required_error: 'posterId is required',
      invalid_type_error: 'posterId must be a string'
    })
  }),
  contributors: z.array(
    z.object({
      contributorName: z.string({
        required_error: 'contributorName is required',
        invalid_type_error: 'contributorName must be a string'
      }),
      contributorId: z.string({
        required_error: 'contributorId is required',
        invalid_type_error: 'contributorId must be a string'
      }),
      contributorImage: z.string({
        required_error: 'contributorImage is required',
        invalid_type_error: 'contributorImage must be a string'
      })
    })
  ),
  postDate: z.string({
    required_error: 'postDate is required',
    invalid_type_error: 'postDate must be a string'
  }),
  reactionsCount: z.string({
    required_error: 'reactionsCount is required',
    invalid_type_error: 'reactionsCount must be a string'
  }),
  bookmarksCount: z.string({
    required_error: 'bookmarksCount is required',
    invalid_type_error: 'bookmarksCount must be a string'
  }),
  postLink: z.string({
    required_error: 'postLink is required',
    invalid_type_error: 'postLink must be a string'
  })
});

export type PostSpecs = z.infer<typeof postSchema>;
