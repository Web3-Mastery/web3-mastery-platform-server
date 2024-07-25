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
                    activityName: {
                        type: String,
                        required: true
                    },
                    activityDescription: {
                        type: String,
                        required: true
                    },
                    activityId: {
                        type: String,
                        required: true
                    }
                    //   validate: {
                    //     validator: (value: any) => {
                    //       return value.every((item: SessionActivitySpecs) => sessionActivitySchema.safeParse(item).success);
                    //     },
                    //     message: 'subSessionActivity must be an object containing relevant details about the current sub-session activity'
                    //   }
                    //   // required: [true, 'subSessionActivity must be stated']
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
