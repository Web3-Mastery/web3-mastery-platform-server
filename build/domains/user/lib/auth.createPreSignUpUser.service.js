import preSignUpUserModel from '../models/preSignUpUser.model.js';
export async function createPreSignUpUser(data) {
    const { user } = data;
    try {
        const newPreSignUpUser = await preSignUpUserModel.create(user);
        return newPreSignUpUser;
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
