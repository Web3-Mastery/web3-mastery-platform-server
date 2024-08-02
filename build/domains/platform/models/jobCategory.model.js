import mongoose from 'mongoose';
// Define the jobCategory schema
const jobCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        trim: true,
        required: [true, 'categoryName is required']
    },
    categoryId: {
        type: String,
        match: [/^\d{4}$/, 'categoryId must be a 4 digit stringed number'],
        required: [true, 'categoryId is required']
    }
}, {
    timestamps: true
});
export default mongoose.model('job-category', jobCategorySchema);
