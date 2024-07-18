import preSignUpUserModel from '../models/preSignUpUser.model.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';

export async function findAndUpdatePreSignUpUser(data: { email?: string; id?: string; requestBody?: UserSpecs }) {
  try {
    const { email, id, requestBody } = data;

    if (email) {
      const user = await preSignUpUserModel.findOneAndUpdate(
        {
          email
        },
        requestBody,
        {
          new: true,
          runValidators: true
        }
      );

      // console.log(user);
      return user;
    }

    if (id) {
      const user = await preSignUpUserModel.findOneAndUpdate({ _id: id }, requestBody, {
        new: true,
        runValidators: true
      });

      return user;
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
