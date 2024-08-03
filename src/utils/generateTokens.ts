import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
import hashingHandler from './hashingHandler.js';

async function generateTokens(data: { /*preSignUpToken?: string;*/ user?: UserSpecs; tokenType?: string; email?: string }) {
  const { user, tokenType } = data;

  const jwtSecret = process.env.JWT_SECRET as string;

  if (tokenType == 'oneTimePasswordToken' && user) {
    if (!user?._id || !user?.email) {
      throw new Error('jwt token generation error: the provided user does not contain an id or email, please provide both');
    }
    // OTP lifetime = 180000ms = 3 minutes
    const oneTimePasswordToken = jwt.sign({ userId: user._id, userEmail: user.email }, jwtSecret, { expiresIn: process.env.JWT_OTP_LIFETIME });

    return oneTimePasswordToken;
  }

  if (tokenType == 'preSignUpToken' && user) {
    const decoyCode = process.env.JWT_SECRET;

    const tokenDraft = `${user.email}_${decoyCode}`;

    const preSignUpToken = hashingHandler({ stringToHash: tokenDraft });

    return preSignUpToken;
  }

  if (tokenType == 'newsletterToken' && user) {
    const decoyCode = process.env.JWT_SECRET;

    const tokenDraft = `${user.email}_${decoyCode}`;

    const newsletterToken = hashingHandler({ stringToHash: tokenDraft });

    return newsletterToken;
  }

  if (user && user.signedUpWithWallet == true) {
    if (!user?._id || !user?.walletAddress) {
      throw new Error('jwt token generation error: the provided user does not contain an id or walletAddress or both, please provide both');
    }

    const accessToken = jwt.sign({ userId: user._id, userEmail: user.walletAddress }, jwtSecret, { expiresIn: process.env.JWT_LIFETIME });

    const salt = await bcrypt.genSalt(14);

    const addressForTokenAGeneration = user.walletAddress as string;
    const refreshTokenPartA = await bcrypt.hash(addressForTokenAGeneration, salt);
    const refreshTokenPartB = process.env.JWT_SECRET as string;

    const refreshToken = `Web3Mastery_SecretRefreshToken_${refreshTokenPartA}_${refreshTokenPartB}`;
    // console.log(refreshToken);

    const tokens = {
      accessToken,
      refreshToken
    };

    return tokens;
  }

  // if only user is provided, this generates both a jwt(access) token, and a custom refresh token.
  if (user && user.signedUpWithWallet !== true) {
    if (!user?._id || !user?.email) {
      throw new Error('jwt token generation error: the provided user does not contain an id or email, please provide both');
    }

    const accessToken = jwt.sign({ userId: user._id, userEmail: user.email }, jwtSecret, { expiresIn: process.env.JWT_LIFETIME });

    const salt = await bcrypt.genSalt(14);

    const emailForTokenAGeneration = user.email as string;
    const refreshTokenPartA = await bcrypt.hash(emailForTokenAGeneration, salt);
    const refreshTokenPartB = process.env.JWT_SECRET as string;

    const refreshToken = `Web3Mastery_SecretRefreshToken_${refreshTokenPartA}_${refreshTokenPartB}`;
    // console.log(refreshToken);

    const tokens = {
      accessToken,
      refreshToken
    };

    return tokens;
  }

  return;
}

export default generateTokens;
