import sessionActivityModel from '../models/sessionActivity.model.js';
export async function findSessionActivity(activityData: { activityName?: string; activityId?: string; activityDescription?: string; _id?: string }) {
  try {
    const { activityName, activityDescription, activityId, _id } = activityData;

    if (activityName) {
      const sessionActivity = await sessionActivityModel.findOne({
        activityName
      });

      // console.log(user);
      return sessionActivity;
    }

    if (activityDescription) {
      const sessionActivity = await sessionActivityModel.findOne({ activityName });

      return sessionActivity;
    }

    if (activityId) {
      const sessionActivity = await sessionActivityModel.findOne({ activityId });

      return sessionActivity;
    }

    if (_id) {
      const sessionActivity = await sessionActivityModel.findOne({ _id });

      return sessionActivity;
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
