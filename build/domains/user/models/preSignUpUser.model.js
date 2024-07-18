// import mongoose, { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';
// const userSchema = new Schema<UserDocument>(
const preSignUpUserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email address'
        ],
        unique: true
    },
    accessToken: {
        type: String
    },
    signUpStatus: {
        type: String,
        default: 'pre-sign-up'
    },
    secretSignUpToken: {
        type: String
    },
    sessions: [
        [
            {
                userIPAddress: {
                    type: String
                    // required: true
                },
                userLocation: {
                    type: String
                    // required: true
                },
                userDeviceData: [
                    {
                        type: String,
                        required: true
                    }
                ],
                subSessionActivity: {
                    type: String
                    // required: [true, 'subSessionActivity must be stated']
                },
                checkInTime: {
                    type: String,
                    // required: true,
                    default: '0'
                },
                sessionId: {
                    type: String,
                    // required: true,
                    default: '1'
                }
            }
        ]
    ]
}, {
    timestamps: true
});
// export default mongoose.model<UserDocument>('User', userSchema);
export default mongoose.model('pre-sign-up-user', preSignUpUserSchema);
