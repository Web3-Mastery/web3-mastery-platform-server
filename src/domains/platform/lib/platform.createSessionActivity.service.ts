import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';
import sessionActivityModel from '../models/sessionActivity.model.js';

export async function createSessionActivity(data: { sessionActivityData: SessionActivitySpecs }) {
  const { sessionActivityData } = data;

  try {
    const newSessionActivity = await sessionActivityModel.create(sessionActivityData);

    return newSessionActivity;
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
