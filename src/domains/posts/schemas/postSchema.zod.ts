import { z } from 'zod';
import { objectIdSchema } from '../../../../globals.d.js';

export const postSchema = z.object({
  postTitle: z.string({
    required_error: 'postTitle is required',
    invalid_type_error: 'postTitle must be a string'
  }),
  postBrief: z.string({
    required_error: 'postBrief is required',
    invalid_type_error: 'postBrief must be a string'
  }),
  postCategory: z.string({
    required_error: 'postCategory is required',
    invalid_type_error: 'postCategory must be a string'
  }),
  postBanner: z.string({
    required_error: 'postBanner is required',
    invalid_type_error: 'postBanner must be a string'
  }),
  postAuthor: z.object({
    authorImage: z.string({
      required_error: 'authorImage is required',
      invalid_type_error: 'authorImage must be a string'
    }),
    authorName: z.string({
      required_error: 'authorName is required',
      invalid_type_error: 'authorName must be a string'
    }),
    authorId: objectIdSchema.optional()
  }),
  reactions: z.object({
    reactedUsers: z.array(
      z.object({
        userId: z.string({
          required_error: 'reactedUserId is required',
          invalid_type_error: 'reactedUserId must be a string'
        })
      })
    ),
    reactionsCount: z.string({
      required_error: 'reactionsCount is required',
      invalid_type_error: 'reactionsCount must be a string'
    })
  }),
  bookmarks: z.object({
    bookmarkedUsers: z.array(
      z.object({
        userId: z.string({
          required_error: 'bookmarkedUserId is required',
          invalid_type_error: 'bookmarkedUserId must be a string'
        })
      })
    ),
    bookmarksCount: z.string({
      required_error: 'bookmarksCount is required',
      invalid_type_error: 'bookmarksCount must be a string'
    })
  }),
  // .optional(),
  contributors: z
    .array(
      z.object({
        contributorName: z.string({
          required_error: 'contributorName is required',
          invalid_type_error: 'contributorName must be a string'
        }),
        contributorId: objectIdSchema.optional(),
        contributorImage: z.string({
          required_error: 'contributorImage is required',
          invalid_type_error: 'contributorImage must be a string'
        })
      })
    )
    .optional(),
  postDate: z.string({
    required_error: 'postDate is required',
    invalid_type_error: 'postDate must be a string'
  }),

  postLink: z.string({
    required_error: 'postLink is required',
    invalid_type_error: 'postLink must be a string'
  }),
  postSlug: z.string({
    required_error: 'postLink is required',
    invalid_type_error: 'postLink must be a string'
  }),
  _id: objectIdSchema.optional()
  // userHasBookmarked: z.boolean({
  //   // required_error: 'userHasBookmarked is required',
  //   invalid_type_error: 'postLink must be boolean'
  // }),
  // userHasReacted: z.boolean({
  //   // required_error: 'userHasReacted is required',
  //   invalid_type_error: 'userHasReacted must be boolean'
  // })
});

export type PostSpecs = z.infer<typeof postSchema>;
