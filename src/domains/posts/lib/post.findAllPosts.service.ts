import postModel from '../models/post.model.js';

export async function findAllPosts() {
  try {
    const allPosts = await postModel.find({});

    // console.log(user);
    return allPosts;
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
