// import mongoose, { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';

/* schema for user-based activity on content - e.g. viewing content, reacting to contentActivityDataSchema, 
and bookmarking content */
const contentActivityDataSchema = new mongoose.Schema({
  contentType: {
    type: String,
    trim: true,
    required: [true, 'contentType is required']
  },
  contentTitle: {
    type: String,
    trim: true,
    required: [true, 'contentTitle is required']
  },
  contentId: {
    type: mongoose.Types.ObjectId,
    ref: 'post',
    unique: true
  },
  contentUrl: {
    type: String,
    trim: true,
    required: [true, 'contentUrl is required']
  }
});

/* schema for user-based activity on jobs - e.g. creating jobs, bookmarking jobs, etc */
const jobActivityDataSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    trim: true,
    required: [true, 'jobTitle is required']
  },
  jobCategory: {
    type: String,
    trim: true,
    required: [true, 'jobType is required']
  },
  jobId: {
    type: mongoose.Types.ObjectId,
    ref: 'post',
    unique: true
  },
  jobUrl: {
    type: String,
    trim: true,
    required: [true, 'jobUrl is required']
  }
});

// const userSchema = new Schema<UserDocument>(
const sessionActivitySchema = new mongoose.Schema<SessionActivitySpecs>(
  {
    activityName: {
      type: String,
      trim: true,
      required: [true, 'activityName is required']
    },
    activityDescription: {
      type: String,
      trim: true,
      required: [true, 'activityDescription is required']
    },
    activityId: {
      type: String,
      trim: true,
      required: [true, 'activityId is required']
    },
    contentActivityData: {
      type: contentActivityDataSchema,
      required: false
    },
    jobActivityData: {
      type: jobActivityDataSchema,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// export default mongoose.model<UserDocument>('User', userSchema);
export default mongoose.model('session-activity', sessionActivitySchema);
