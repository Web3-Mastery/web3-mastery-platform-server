import newsletterSubscriberModel from '../models/newsletter-subscriber.model.js';
import log from '../../../utils/logger.js';
import type { NewsletterSubscriberSpecs } from '../schemas/newsletter-subscriber.zod.js';

export async function createNewsletterSubscription(data: { subscriber: NewsletterSubscriberSpecs }) {
  try {
    const { subscriber } = data;
    const newSubscriber = await newsletterSubscriberModel.create(subscriber);

    console.log(newSubscriber);

    return newSubscriber;
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message);
      throw new Error(error.message);
    } else {
      log.error(error);
      throw new Error('An error occurred');
    }
  }
}
