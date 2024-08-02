import type { PostCategorySpecs } from '../../schemas/postCategory.schema.js';
import postCategoryModel from '../../models/postCategory.model.js';

export async function createPostCategory(data: { postCategoryData: PostCategorySpecs }) {
  const { postCategoryData } = data;

  try {
    const newPostCategory = await postCategoryModel.create(postCategoryData);

    return newPostCategory;
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
