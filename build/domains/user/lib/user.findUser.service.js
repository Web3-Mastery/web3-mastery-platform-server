import userModel from '../models/user.model.js';
export async function findUser(userData) {
    try {
        const { email, id, walletAddress } = userData;
        if (email) {
            const user = await userModel.findOne({
                email
            });
            // console.log(user);
            return user;
        }
        if (id) {
            const user = await userModel.findOne({ _id: id });
            return user;
        }
        if (walletAddress) {
            const user = await userModel.findOne({ walletAddress });
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
