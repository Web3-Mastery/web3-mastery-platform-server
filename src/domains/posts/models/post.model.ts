import mongoose from 'mongoose';
import type { PostSpecs } from '../schemas/postSchema.zod.js';

const postSchema = new mongoose.Schema<PostSpecs>(
  {
    postTitle: {
      type: String,
      required: [true, 'postTitle is required'],
      trim: true
    },
    postSummary: {
      type: String,
      required: [true, 'postSummary is required'],
      trim: true
    },
    postBanner: {
      type: String,
      required: [true, 'postBanner is required'],
      trim: true
    },
    postedBy: {
      authorImage: {
        type: String,
        required: [true, 'authorImage is required'],
        trim: true
      },
      authorName: {
        type: String,
        required: [true, 'authorName is required'],
        trim: true
      },
      authorId: {
        type: String,
        required: [true, 'authorId is required'],
        trim: true
      }
    },
    contributors: [
      {
        contributorName: {
          type: String,
          required: [true, 'contributorName is required'],
          trim: true
        },
        contributorId: {
          type: String,
          required: [true, 'contributorId is required'],
          trim: true
        },
        contributorImage: {
          type: String,
          required: [true, 'contributorImage is required'],
          trim: true
        }
      }
    ],
    postDate: {
      type: String,
      required: [true, 'postDate is required'],
      trim: true
    },
    reactionsCount: {
      type: String,
      required: [true, 'reactionsCount is required'],
      trim: true
    },
    bookmarksCount: {
      type: String,
      required: [true, 'bookmarksCount is required'],
      trim: true
    },
    postLink: {
      type: String,
      required: [true, 'postLink is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('post', postSchema);
