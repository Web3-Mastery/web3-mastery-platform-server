// import mongoose, { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';
import { postSchema } from '../../posts/schemas/postSchema.zod.js';
import { jobSchema } from '../../jobs/schemas/jobSchema.zod.js';
// import { sessionActivitySchema } from '../../platform/schemas/sessionActivity.schema.js';
// interface UserDocument extends Document, UserSpecs {}
// interface _UserSpecs extends UserSpecs {
//   createdAt: Date;
//   updatedAt: Date;
// }
// const userSchema = new Schema<UserDocument>(
const userSchema = new mongoose.Schema({
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
    bio: {
        type: String
    },
    password: {
        type: String
    },
    confirmPassword: {
        type: String
    },
    website: {
        type: String,
        trim: true
        // required: [true, 'website is required']
    },
    linkedInProfile: {
        type: String,
        trim: true
        // required: [true, 'linkedInProfile is required']
    },
    githubProfile: {
        type: String,
        trim: true
        // required: [true, 'gitHubProfile is required']
    },
    twitterProfile: {
        type: String,
        trim: true
        // required: [true, 'twitterProfile is required']
    },
    youtubeProfile: {
        type: String,
        trim: true
        // required: [true, 'youTubeProfile is required']
    },
    resume: {
        type: String,
        trim: true
        // required: [true, 'resume is required']
    },
    communityRank: {
        type: String
        // required: [true, 'communityRank is required']
    },
    walletAddress: {
        type: String
        // required: [true, 'walletAddress is required']
    },
    isRecruiterEnabled: {
        type: Boolean
        // required: [true, 'isRecruiterEnabled is required']
    },
    savedJobs: {
        type: [Object],
        validate: {
            validator: (value) => {
                return value.every((item) => jobSchema.safeParse(item).success);
            },
            message: 'savedJobs must be an array of valid job objects'
        }
    },
    bookMarks: {
        type: [Object],
        validate: {
            validator: (value) => {
                return value.every((item) => postSchema.safeParse(item).success);
            },
            message: 'bookMarks must be an array of valid post objects'
        }
    },
    accessToken: {
        type: String
        // required: [true, 'access token is required']
    },
    oneTimePassword: {
        type: String
    },
    oneTimePasswordToken: {
        type: String
    },
    secretSignUpToken: {
        type: String,
        trim: true
    },
    signUpStatus: {
        type: String
    },
    skills: {
        type: [String]
        // required: [true, 'skills are required']
    },
    education: [
        {
            institution: {
                type: String,
                trim: true
                // required: [true, 'institution is required']
            },
            degree: {
                type: String,
                trim: true
                // required: [true, 'degree is required']
            },
            startYear: {
                type: String,
                trim: true
                // required: [true, 'start year is required']
            },
            endYear: {
                type: String,
                trim: true
                // required: [true, 'end year is required']
            }
        }
    ],
    experience: [
        {
            company: {
                type: String,
                trim: true
                // required: [true, 'company is required']
            },
            position: {
                type: String,
                trim: true
                // required: [true, 'position is required']
            },
            achievements: {
                type: String,
                trim: true
                // required: [true, 'achievements is required']
            },
            startYear: {
                type: String,
                trim: true
                // required: [true, 'start year is required']
            },
            endYear: {
                type: String,
                trim: true
                // required: [true, 'end year is required']
            }
        }
    ],
    sessions: [
        [
            {
                userIPAddress: {
                    type: String,
                    trim: true
                    // required: [true, 'userIPAddress is required']
                },
                userLocation: {
                    type: String,
                    trim: true
                    // required: [true, 'userLocation is required']
                },
                userDeviceData: [
                    {
                        type: mongoose.Schema.Types.Mixed
                        // required: [true, 'userDevice data is required']
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
                    trim: true
                    // required: [true, 'checkInTime is required']
                },
                sessionId: {
                    type: String,
                    trim: true
                    // required: [true, 'sessionId is required']
                }
            }
        ]
    ]
}, {
    timestamps: true
});
// export default mongoose.model<UserDocument>('User', userSchema);
export default mongoose.model('user', userSchema);
