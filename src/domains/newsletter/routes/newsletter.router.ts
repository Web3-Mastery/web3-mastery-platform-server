import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import { newsletterSubscriberSchema } from '../schemas/newsletter-subscriber.zod.js';
import createSubscription from '../controllers/newsletter.createSubscription.controller.js';

// express router init
const router = express.Router();

// routes

router.route('/subscribe-to-newsletter').post(validateData({ body: newsletterSubscriberSchema }), createSubscription);

export default router;
