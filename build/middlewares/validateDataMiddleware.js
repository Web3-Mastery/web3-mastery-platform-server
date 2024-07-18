import { ZodError } from 'zod';
export const validateData = (dataSchema) => {
    return (req, res, next) => {
        try {
            if (dataSchema.body && req.body) {
                req.body = dataSchema.body.parse(req.body);
                // console.log(req.body);
            }
            if (dataSchema.params && req.body) {
                req.params = dataSchema.params.parse(req.params);
                // console.log(req.params);
            }
            // if (dataSchema.query && req.query) {
            //   req.query = dataSchema.query.parse(req.query);
            // }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                console.log(error);
                return res.status(400).json({
                    error: 'ZodError(input validation error)',
                    responseMessage: error
                });
            }
            else {
                return res.status(500).json({
                    responseMessage: 'user input error',
                    error: error
                });
            }
        }
        return;
    };
};
