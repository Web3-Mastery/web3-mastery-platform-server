import type { UserSpecs } from '../schemas/userSchema.zod.js';
import userModel from '../models/user.model.js';

export async function createUser(data: { user: UserSpecs }) {
  const { user } = data;

  try {
    const newUser = await userModel.create(user);

    return newUser;
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
