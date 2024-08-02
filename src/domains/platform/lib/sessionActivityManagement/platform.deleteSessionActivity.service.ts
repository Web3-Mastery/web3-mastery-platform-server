import sessionActivityModel from '../../models/sessionActivity.model.js';

export async function deleteSessionActivity(data: { activityId?: string }) {
  try {
    const { activityId } = data;

    if (activityId) {
      const deletedSessionActivity = await sessionActivityModel.deleteOne({
        activityId
      });

      // console.log(user);
      return deletedSessionActivity;
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
