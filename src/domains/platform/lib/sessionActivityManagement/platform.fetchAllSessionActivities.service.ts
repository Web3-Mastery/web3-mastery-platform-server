import sessionActivityModel from '../../models/sessionActivity.model.js';
export async function fetchAllPlatformSessionActivities() {
  try {
    const platformSessionActivities = await sessionActivityModel.find({});

    // console.log(user);
    return platformSessionActivities;
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
