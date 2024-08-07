import userModel from '../models/user.model.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';

export async function findAndUpdateUser(data: { email?: string; id?: string; walletAddress?: string; requestBody?: UserSpecs }) {
  try {
    const { email, id, requestBody, walletAddress } = data;

    if (email) {
      const user = await userModel.findOneAndUpdate(
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
      const user = await userModel.findOneAndUpdate({ _id: id }, requestBody, {
        new: true,
        runValidators: true
      });

      return user;
    }

    if (walletAddress) {
      const user = await userModel.findOneAndUpdate({ walletAddress }, requestBody, {
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
