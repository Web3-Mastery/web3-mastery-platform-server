// import userModel from '../models/user.model.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import preSignUpUserModel from '../models/preSignUpUser.model.js';

export async function createPreSignUpUser(data: { user: UserSpecs }) {
  const { user } = data;

  try {
    const newPreSignUpUser = await preSignUpUserModel.create(user);

    return newPreSignUpUser;
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
