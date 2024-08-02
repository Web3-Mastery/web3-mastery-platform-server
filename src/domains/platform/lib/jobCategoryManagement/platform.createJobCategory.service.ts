import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import jobCategoryModel from '../../models/jobCategory.model.js';

export async function createJobCategory(data: { jobCategoryData: JobCategorySpecs }) {
  const { jobCategoryData } = data;

  try {
    const newJobCategory = await jobCategoryModel.create(jobCategoryData);

    return newJobCategory;
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
