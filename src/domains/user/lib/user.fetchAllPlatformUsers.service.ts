import userModel from '../models/user.model.js';

export async function fetchAllPlatformUsers() {
  try {
    const allUsers = await userModel.find({});

    // console.log(user);
    return allUsers;
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
