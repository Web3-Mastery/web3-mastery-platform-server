import postModel from '../models/post.model.js';
export async function findPost(data) {
    try {
        if (data.postSlug) {
            const foundPost = await postModel.findOne({ postSlug: data.postSlug });
            // console.log(user);
            return foundPost;
        }
        if (data.postId) {
            const foundPost = await postModel.findOne({ _id: data.postId });
            // console.log(user);
            return foundPost;
        }
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            throw new Error(error.message);
        }
        else {
            console.log(error);
            throw new Error('An error occurred');
        }
    }
}
