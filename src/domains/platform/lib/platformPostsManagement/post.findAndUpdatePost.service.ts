import postModel from '../../../posts/models/post.model.js';
import type { PostSpecs } from '../../../posts/schemas/postSchema.zod.js';

export async function findAndUpdatePost(data: { postSlug: string; requestBody: PostSpecs }) {
  try {
    const updatedPost = await postModel.findOneAndUpdate({ postSlug: data.postSlug }, data.requestBody, {
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
