import jobModel from '../models/job.model.js';

export async function deleteJob(data: { jobId?: string }) {
  try {
    const { jobId } = data;

    if (jobId) {
      const deleteResponse = await jobModel.deleteOne({
        _id: jobId
      });

      // console.log(user);
      return deleteResponse;
    }

    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    } else {
      console.log(error);
      throw new Error('An error occurred');
    }
  }
}
