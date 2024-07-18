import preSignUpUserModel from '../models/preSignUpUser.model.js';
export async function findPreSignUpUser(data) {
    try {
        const { email, id, preSignUpToken } = data;
        if (email) {
            const user = await preSignUpUserModel.findOne({
                email
            });
            // console.log(user);
            return user;
        }
        if (id) {
            const user = await preSignUpUserModel.findOne({ _id: id });
            return user;
        }
        if (preSignUpToken) {
            const user = await preSignUpUserModel.findOne({ secretSignUpToken: preSignUpToken });
            return user;
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
