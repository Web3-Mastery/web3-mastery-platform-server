import jobCategoryModel from '../../models/jobCategory.model.js';
export async function fetchAllJobCategories() {
    try {
        const platformJobCategories = await jobCategoryModel.find({});
        // console.log(user);
        return platformJobCategories;
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
