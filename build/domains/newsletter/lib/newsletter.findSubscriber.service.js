import newsletterSubscriberModel from '../models/newsletter-subscriber.model.js';
// import { newsletterSubscriberSchema } from "../schemas/newsletter-subscriber.zod.js";
export async function findNewsletterSubscriber(data) {
    const newsletterSubscriber = await newsletterSubscriberModel.findOne({ email: data.email });
    return newsletterSubscriber;
}
