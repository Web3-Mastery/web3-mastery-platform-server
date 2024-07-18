const jwt = require('jsonwebtoken');
const findUser = require('../domains/user/lib/findUser.service.js');
const generateTokens = require('../utils/generateTokens.js');

// import generateTokens from '../utils/generateTokens.js';

const authMiddleware = async (req, res, next) => {
  const requestHeaders = req.headers;

  const { email, authorization } = requestHeaders;
  const jwtSecret = process.env.JWT_SECRET;

  try {
    if (!req.headers.cookie || !req.headers.cookie.includes('PrivatePractice_SecretRefreshToken')) {
      return res.status(401).json({
        error: 'access forbidden',
        responseMessage: 'user does not have access to the route - please attempt a fresh log-in'
      });
    }

    /** implementation pause: I need all user types migrated in before I can proceed with this implementation. I can't access all the 
    domains, I won't be able to search for all the userTypes and proceed with the implementation. **/

    //check if user exist
    const user = await findUser({ email });
    // console.log(user);

    if (!user) {
      return res.status(404).json({
        error: 'access forbidden',
        responseMessage: 'user not found or does not exist: user does not have access to this route'
      });
    }

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(403).json({
        error: 'access forbidden',
        responseMessage: 'authorization string does not match expected(Bearer Token) result'
      });
    }

    const returnedToken = authorization.split(' ')[1];
    // console.log(returnedToken);

    if (returnedToken && user) {
      const decodedJWT = jwt.verify(returnedToken, jwtSecret);
      // console.log(decodedJWT);

      // console.log(decodedJWT.userId);
      // console.log(user._id);

      if (!decodedJWT || decodedJWT.userEmail !== user.email) {
        return res.status(403).json({
          error: 'access forbidden',
          responseMessage: 'user credentials do not match'
        });
      }

      // const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
      // console.log(currentTimestampInSeconds)
      // const tokenExpirationTimeInSeconds = decodedJWT.exp;
      // console.log(tokenExpirationTimeInSeconds)

      // if (tokenExpirationTimeInSeconds > currentTimestampInSeconds) {
      const generatedTokens = await generateTokens(user);
      const { refreshToken, accessToken } = generatedTokens;

      const tokenStatus = `user access-token and user session for '${decodedJWT.userEmail}' has been renewed`;

      /* proceed to renew user session here */
      /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
      5. user's device data(get and add as much as possible), 6. duration since last session - check for previous user session end-time, 
      and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
      days, months, or years.  */
      // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future

      // console.log(req.user);

      // console.log(tokenStatus);

      // console.log(req.user);
      req.user = {
        userId: decodedJWT.userId,
        userEmail: decodedJWT.userEmail,
        tokenStatus,
        renewedUserAccessToken: accessToken,
        renewedUserRefreshToken: refreshToken
        // };
      };
    }

    // proceed to next middleware or route
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'jwt expired') {
      /* Access token is expired. Verify token(ignoring expiry) to make sure it's the user,
      then regenerate new tokens(access and refresh) and pass from middleware */

      // needed to get user again since initial user instance was in another code block above
      const user = await findUser({ email });
      // console.log(`catch block ${user}`);

      if (!user) {
        return res.status(404).json({
          error: 'access forbidden',
          responseMessage: 'user not found: user does not have access to this route'
        });
      }

      const generatedTokens = await generateTokens(user);
      const { refreshToken, accessToken } = generatedTokens;

      // wrong: not to verify directly - instead update DB access token to prevent continuous token regeneration response - due to the expired one being re-used.
      const decodedJWT = jwt.verify(accessToken, jwtSecret, {
        ignoreExpiration: true
      });

      // console.log(decodedJWT.userId);
      // console.log(user._id);

      if (!decodedJWT || decodedJWT.userEmail !== user.email) {
        return res.status(401).json({
          error: 'access forbidden',
          responseMessage: 'user credentials do not match - user login unsuccessful'
        });
      }

      const tokenStatus = `in error block: previous user access-token for '${decodedJWT.userEmail}' is expired - access-token and user session has been renewed`;
      console.log(tokenStatus);

      /* proceed to renew user session here */
      /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
      5. user's device data(get and add as much as possible), 6. duration since last session - check for previous user session end-time, 
      and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
      days, months, or years.  */
      // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future

      // console.log(req.user);

      // the front-end should have a util for updating the local storage with the access token and another data that might need to keep
      // getting updated
      req.user = {
        userId: decodedJWT.userId,
        userEmail: decodedJWT.userEmail,
        tokenStatus,
        renewedUserAccessToken: accessToken,
        renewedUserRefreshToken: refreshToken
      };

      next();
    } else {
      return res.status(500).json({
        responseMessage: 'unauthorized access',
        error: error
      });
    }
  }

  return;
};

export default authMiddleware;
