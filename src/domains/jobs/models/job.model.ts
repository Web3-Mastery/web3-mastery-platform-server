import mongoose from 'mongoose';
import type { JobSpecs } from '../schemas/jobSchema.zod.js';

const jobSchema = new mongoose.Schema<JobSpecs>(
  {
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyLogo: {
      type: String,
      // required: [true, 'Company logo is required'],
      trim: true
    },
    tags: {
      type: [String]
      // required: [true, 'Tags are required']
    },
    experienceLevel: {
      type: String,
      // required: [true, 'Experience level is required'],
      trim: true
    },
    jobNatureAndLocation: {
      type: String,
      required: [true, 'Nature of the job and job location are required'],
      trim: true
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    jobCategory: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    requiredSkills: {
      type: [String]
      // required: [true, 'Required skills are required']
    },
    timeDemand: {
      type: String,
      required: [true, 'Time demand is required'],
      trim: true
    },
    companyWebsite: {
      type: String,
      // required: [true, 'Company website is required'],
      match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please provide a valid URL']
    },
    companyLinkedInProfile: {
      type: String,
      // required: [true, 'Company LinkedIn profile is required'],
      match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please provide a valid URL']
    },
    companyTwitterProfile: {
      type: String,
      // required: [true, 'Company Twitter profile is required'],
      match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please provide a valid URL']
    },
    postedBy: {
      posterName: {
        type: String,
        required: [true, 'Poster name is required'],
        trim: true
      },
      posterId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: [true, 'Poster ID is required'],
        trim: true
      }
    },
    bookmarks: {
      bookmarkedUsers: [
        {
          userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            unique: true,
            required: [true, 'bookmarkUserId is required'],
            trim: true
          }
        }
      ],
      bookmarksCount: {
        type: String,
        required: [true, 'bookmarksCount is required'],
        trim: true
      }
    },
    jobLink: {
      type: String,
      required: [true, 'jobLink required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('job', jobSchema);
