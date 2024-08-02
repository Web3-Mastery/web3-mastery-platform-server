import type { JobSpecs } from '../schemas/jobSchema.zod.js';
import jobModel from '../models/job.model.js';

export async function createJob(data: { jobData: JobSpecs }) {
  const { jobData } = data;

  try {
    const newJob = await jobModel.create(jobData);

    return newJob;
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
