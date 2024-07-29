import sessionActivityModel from '../models/sessionActivity.model.js';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';

export async function findAndUpdateSessionActivity(data: { activityId?: string; requestBody?: SessionActivitySpecs }) {
  try {
    const { activityId, requestBody } = data;

    const updatedSessionActivity = await sessionActivityModel.findOneAndUpdate({ activityId }, requestBody, {
      new: true,
      runValidators: true
    });

    return updatedSessionActivity;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    } else {
      console.log(error);
      throw new Error('An error occurred');
    }
  }
}
