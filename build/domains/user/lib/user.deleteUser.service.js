import userModel from '../models/user.model.js';
export async function deleteUser(data) {
    try {
        const { email, id, preSignUpToken } = data;
        if (email) {
            const deletedUser = await userModel.deleteOne({
                email
            });
            // console.log(user);
            return deletedUser;
        }
        if (id) {
            const deletedUser = await userModel.deleteOne({ _id: id });
            return deletedUser;
        }
        if (preSignUpToken) {
            const deletedUser = await userModel.deleteOne({ secretSignUpToken: preSignUpToken });
            return deletedUser;
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
