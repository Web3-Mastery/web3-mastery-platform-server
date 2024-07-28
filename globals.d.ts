import type { Request } from 'express';
import * as z from 'zod';

// Augment the Express Request type - more like extending express(with ts) globally
declare module 'express' {
  interface Request {
    user?: {
      userId?: string;
      userEmail?: string;
      sessionStatus?: string;
      // renewedUserAccessToken?: string;
      // renewedUserRefreshToken?: string;
      newUserAccessToken?: string;
      newUserRefreshToken?: string;
      subSessionActivityId?: string;
    };
  }
}

export const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId'
});
