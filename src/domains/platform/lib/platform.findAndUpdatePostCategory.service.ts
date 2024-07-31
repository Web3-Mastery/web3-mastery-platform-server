import sessionActivityModel from '../models/sessionActivity.model.js';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';

export async function findAndUpdatePostCategory(data: { categoryId?: string; requestBody?: SessionActivitySpecs }) {
  try {
    const { categoryId, requestBody } = data;

    const updatedPostCategory = await sessionActivityModel.findOneAndUpdate({ categoryId }, requestBody, {
      new: true,
      runValidators: true
    });

    return updatedPostCategory;
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
