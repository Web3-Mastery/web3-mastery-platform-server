import postModel from '../../posts/models/post.model.js';

export async function deletePost(data: { postSlug?: string }) {
  try {
    const { postSlug } = data;

    if (postSlug) {
      const deletedPost = await postModel.deleteOne({
        postSlug
      });

      // console.log(user);
      return deletedPost;
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
