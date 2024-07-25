// import mongoose, { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';

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
    }
  },
  {
    timestamps: true
  }
);

// export default mongoose.model<UserDocument>('User', userSchema);
export default mongoose.model('session-activity', sessionActivitySchema);
