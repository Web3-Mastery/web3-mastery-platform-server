import postModel from '../models/post.model.js';
export async function findPost(data: { postSlug: string }) {
  try {
    const foundPost = await postModel.findOne({ postSlug: data.postSlug });

    // console.log(user);
    return foundPost;
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
