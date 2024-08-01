// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
// import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
// import { findUser } from '../domains/user/lib/user.findUser.service.js';
// import generateTokens from '../utils/generateTokens.js';

// type ResponseSpecs = {
//   error?: string;
//   responseMessage: string;
//   response?: {
//     adminUser: UserSpecs;
//     // token: string;
//   };
// };

// @ts-ignore
const verifyUserDataToControllerMiddleware = async (req: Request, res: Response<ResponseSpecs>, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        error: 'request rejected',
        responseMessage: 'expected user data not available from previous middleware'
      });
    } else {
      // proceed to next middleware or route
      next();
    }
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

export default verifyUserDataToControllerMiddleware;
