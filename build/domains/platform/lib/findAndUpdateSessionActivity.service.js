import sessionActivityModel from '../models/sessionActivity.model.js';
export async function findAndUpdateSessionActivity(data) {
    try {
        const { activityId, requestBody } = data;
        const user = await sessionActivityModel.findOneAndUpdate({ activityId }, requestBody, {
            new: true,
            runValidators: true
        });
        return user;
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
