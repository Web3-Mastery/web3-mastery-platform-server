import jobCategoryModel from '../../models/jobCategory.model.js';
export async function findJobCategory(categoryData) {
    try {
        const { categoryName, categoryId } = categoryData;
        if (categoryName) {
            const newJobCategory = await jobCategoryModel.findOne({
                categoryName
            });
            // console.log(user);
            return newJobCategory;
        }
        if (categoryId) {
            const newJobCategory = await jobCategoryModel.findOne({ categoryId });
            return newJobCategory;
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
