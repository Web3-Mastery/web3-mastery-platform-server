import postCategoryModel from '../models/postCategory.model.js';

export async function fetchAllPlatformSessionActivities() {
  try {
    const platformPostCategories = await postCategoryModel.find({});

    // console.log(user);
    return platformPostCategories;
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
