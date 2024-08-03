import mongoose from 'mongoose';
const newsletterSubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email address'
        ],
        unique: true
    },
    isPlatformUser: {
        type: Boolean
        // required: [true, 'isAdmin is required']
    },
    platformUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        // required: [true, 'platformUserId is required'],
        trim: true
    }
}, {
    timestamps: true
});
export default mongoose.model('newsletter-subscriber', newsletterSubscriberSchema);
