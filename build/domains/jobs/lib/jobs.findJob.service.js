import jobModel from '../models/job.model.js';
export async function findJob(data) {
    try {
        const foundJob = await jobModel.findOne({ _id: data.jobId });
        // console.log(user);
        return foundJob;
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
