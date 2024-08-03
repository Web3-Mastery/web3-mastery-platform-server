import newsletterSubscriberModel from '../models/newsletter-subscriber.model.js';
// import { newsletterSubscriberSchema } from "../schemas/newsletter-subscriber.zod.js";
export async function updateNewsletterSubscriber(data) {
    const newsletterSubscriber = await newsletterSubscriberModel.findOneAndUpdate({ email: data.email });
    return newsletterSubscriber;
}
