import jobCategoryModel from '../../models/jobCategory.model.js';

export async function deleteJobCategory(data: { categoryId?: string }) {
  try {
    const { categoryId } = data;

    if (categoryId) {
      const deletedJobCategory = await jobCategoryModel.deleteOne({
        categoryId
      });

      // console.log(user);
      return deletedJobCategory;
    }

    return;
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
