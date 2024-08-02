import postCategoryModel from '../../models/postCategory.model.js';

export async function findPostCategory(categoryData: { categoryName?: string; categoryId?: string }) {
  try {
    const { categoryName, categoryId } = categoryData;

    if (categoryName) {
      const newPostCategory = await postCategoryModel.findOne({
        categoryName
      });

      // console.log(user);
      return newPostCategory;
    }

    if (categoryId) {
      const newPostCategory = await postCategoryModel.findOne({ categoryId });

      return newPostCategory;
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
