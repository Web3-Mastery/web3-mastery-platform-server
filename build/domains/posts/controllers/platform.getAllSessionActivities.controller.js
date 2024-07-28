// import type { Request, Response } from 'express';
// import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';
// import { fetchAllPlatformSessionActivities } from '../lib/fetchAllSessionActivities.service.js';
export {};
// // description: get user profile payout-data(by ID), and send back relevant data as response.
// // request: GET
// // route: '/api/v1/platform/get-all-platform-session-activity";
// // access: Private | external
// type ResponseSpecs = {
//   error?: string;
//   responseMessage: string;
//   response?: {
//     platformSessionActivities: SessionActivitySpecs[];
//   };
// };
// // @ts-ignore
// const getAllPlatformSessionActivities = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
//   try {
//     // if (req.user) {
//     const platformSessionActivities = await fetchAllPlatformSessionActivities();
//     if (!platformSessionActivities) {
//       return res.status(400).json({
//         error: 'item not found',
//         responseMessage: `could not fetch platform session activity list: list not found of does not exist`
//       });
//     }
//     // update refresh token(cookie)
//     // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
//     //   httpOnly: true,
//     //   secure: true,
//     //   sameSite: 'none', // Prevent CSRF attacks
//     //   maxAge: 24 * 60 * 60 * 1000 // 1 day
//     // });
//     if (platformSessionActivities) {
//       return res.status(200).json({
//         responseMessage: `user profile fetched successfully`,
//         response: {
//           platformSessionActivities: platformSessionActivities
//         }
//       });
//     }
//     // }
//     return;
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({
//         responseMessage: 'request was unsuccessful',
//         error: error.message
//       });
//     } else {
//       return res.status(500).json({
//         responseMessage: 'request was unsuccessful: please try again',
//         error: error as string
//       });
//     }
//   }
// };
// export default getAllPlatformSessionActivities;
