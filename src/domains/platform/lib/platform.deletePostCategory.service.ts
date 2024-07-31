import postCategoryModel from '../models/postCategory.model.js';

export async function deletePostCategory(data: { categoryId?: string }) {
  try {
    const { categoryId } = data;

    if (categoryId) {
      const deletedPostCategory = await postCategoryModel.deleteOne({
        categoryId
      });

      // console.log(user);
      return deletedPostCategory;
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
