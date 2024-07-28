import postModel from '../models/post.model.js';
export async function createPost(data) {
    const { postData } = data;
    try {
        const newPost = await postModel.create(postData);
        return newPost;
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
