import jobModel from '../models/job.model.js';

export async function findAllJobs() {
  try {
    const allJobs = await jobModel.find({});

    // console.log(user);
    return allJobs;
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
