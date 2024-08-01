// import { TokenExpiredError } from 'jsonwebtoken';
import {} from 'express';
// @ts-ignore
const verifyPrivacyMiddleware = async (req, res, next) => {
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
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                throw new Error(error.message);
            }
            else {
                console.log(error);
                throw new Error('An error occurred');
            }
        }
    }
};
export default verifyPrivacyMiddleware;
