import jobModel from '../models/job.model.js';
export async function findAndUpdateJob(data) {
    try {
        const updatedJob = await jobModel.findOneAndUpdate({ _id: data.jobId }, data.requestBody, {
            new: true,
            runValidators: true
        });
        return updatedJob;
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
