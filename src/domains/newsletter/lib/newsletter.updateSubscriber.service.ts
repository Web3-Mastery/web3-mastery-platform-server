import newsletterSubscriberModel from '../models/newsletter-subscriber.model.js';
import type { NewsletterSubscriberSpecs } from '../schemas/newsletter-subscriber.zod.js';
// import { newsletterSubscriberSchema } from "../schemas/newsletter-subscriber.zod.js";

export async function updateNewsletterSubscriber(data: { email: string; requestBody?: NewsletterSubscriberSpecs }) {
  const newsletterSubscriber = await newsletterSubscriberModel.findOneAndUpdate({ email: data.email });

  return newsletterSubscriber;
}
