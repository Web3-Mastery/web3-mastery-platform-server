import type { PostSpecs } from '../schemas/postSchema.zod.js';
import postModel from '../models/post.model.js';
export async function findAndUpdatePost(data: { postSlug: string; postData: PostSpecs }) {
  try {
    const updatedPost = await postModel.findOneAndUpdate({ postSlug: data.postSlug }, data.postData, {
      new: true,
      runValidators: true
    });

    return updatedPost;
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
