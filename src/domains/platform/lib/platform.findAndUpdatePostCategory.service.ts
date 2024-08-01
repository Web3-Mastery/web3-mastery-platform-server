import postCategoryModel from '../models/postCategory.model.js';
import type { PostCategorySpecs } from '../schemas/postCategory.schema.js';

export async function findAndUpdatePostCategory(data: { categoryId?: string; requestBody?: PostCategorySpecs }) {
  try {
    const { categoryId, requestBody } = data;

    const updatedPostCategory = await postCategoryModel.findOneAndUpdate({ categoryId }, requestBody, {
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
