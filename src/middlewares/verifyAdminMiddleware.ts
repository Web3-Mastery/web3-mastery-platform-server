// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
import { findUser } from '../domains/user/lib/user.findUser.service.js';
// import generateTokens from '../utils/generateTokens.js';

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    adminUser: UserSpecs;
    // token: string;
  };
};

// @ts-ignore
const verifyAdminMiddleware = async (req: Request, res: Response<ResponseSpecs>, next: NextFunction) => {
  try {
    // if (req.user) {
    const { administratorEmail: email } = req.query;

    const adminEmail = email as string;

    // const { userEmail: email } = req.header;

    // if (email !== emailFromRequestBody) {
    //   return res.status(403).json({
    //     error: 'user error',
    //     responseMessage: `user/email provided in request header is not authorized to perform actions for user with email: '${emailFromRequestBody}'`
    //   });
    // }

    const user = await findUser({ email: adminEmail });
    // console.log(user);

    // console.log('user', user);

    if (!user) {
      return res.status(403).json({
        error: 'request rejected',
        responseMessage: `user with email: ${adminEmail} not found or does not exist`
      });
    }

    if (user.isAdmin !== true) {
      return res.status(403).json({
        error: 'request rejected',
        responseMessage: 'only platform administrators are allowed to perform this activity'
      });
    }

    // proceed to next middleware or route

    next();
    // }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    } else {
      console.log(error);
      throw new Error('An error occurred');
    }
  }
};

export default verifyAdminMiddleware;
