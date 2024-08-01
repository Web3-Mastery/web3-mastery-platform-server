// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
// import { findUser } from '../domains/user/lib/user.findUser.service.js';
// import generateTokens from '../utils/generateTokens.js';

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    personalUser: UserSpecs;
    // token: string;
  };
};

// @ts-ignore
const verifyPrivacyMiddleware = async (req: Request<{ userId: string }, ResponseSpecs>, res: Response<ResponseSpecs>, next: NextFunction) => {
  if (req.user) {
    try {
      const { userId } = req.params;

      if (req.user.userId !== userId) {
        return res.status(403).json({
          error: 'user error',
          responseMessage: `user provided in request header is not authorized to perform this action for user with id: '${userId}'`
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
  }
};

export default verifyPrivacyMiddleware;
