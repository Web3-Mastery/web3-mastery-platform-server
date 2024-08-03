import type { PostSpecs } from '../schemas/postSchema.zod.js';
import postModel from '../models/post.model.js';
export async function findAndUpdatePost(data: { postSlug?: string; postId?: string; postData: PostSpecs }) {
  const { postData, postId, postSlug } = data;

  try {
    if (postSlug) {
      const updatedPost = await postModel.findOneAndUpdate({ postSlug: postSlug }, postData, {
        new: true,
        runValidators: true
      });

      return updatedPost;
    }

    if (postId) {
      const updatedPost = await postModel.findOneAndUpdate({ _id: postId }, postData, {
        new: true,
        runValidators: true
      });

      return updatedPost;
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
