import jobCategoryModel from '../../models/jobCategory.model.js';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';

export async function findAndUpdateJobCategory(data: { categoryId?: string; requestBody?: JobCategorySpecs }) {
  try {
    const { categoryId, requestBody } = data;

    const updatedJobCategory = await jobCategoryModel.findOneAndUpdate({ categoryId }, requestBody, {
      new: true,
      runValidators: true
    });

    return updatedJobCategory;
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
