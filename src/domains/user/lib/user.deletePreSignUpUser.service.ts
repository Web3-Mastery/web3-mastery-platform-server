import preSignUpUserModel from '../models/preSignUpUser.model.js';

export async function deletePreSignUpUser(data: { email?: string; id?: string; preSignUpToken?: string }) {
  try {
    const { email, id, preSignUpToken } = data;

    if (email) {
      const preSignUpUser = await preSignUpUserModel.deleteOne({
        email
      });

      // console.log(user);
      return preSignUpUser;
    }

    if (id) {
      const preSignUpUser = await preSignUpUserModel.deleteOne({ _id: id });

      return preSignUpUser;
    }

    if (preSignUpToken) {
      const preSignUpUser = await preSignUpUserModel.deleteOne({ secretSignUpToken: preSignUpToken });

      return preSignUpUser;
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
