import mongoose from 'mongoose';
// Define the postCategory schema
const postCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        trim: true,
        required: [true, 'categoryName is required']
    },
    categoryId: {
        type: String,
        match: [/^\d{4}$/, 'categoryId must be a 4 digit stringed number'],
        required: [true, 'categoryId is required']
    },
    categoryContentType: {
        type: String,
        trim: true,
        required: [true, 'categoryContentType is required']
    }
}, {
    timestamps: true
});
export default mongoose.model('post-category', postCategorySchema);
