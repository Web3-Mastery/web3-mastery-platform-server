import mongoose from 'mongoose';
import type { NewsletterSubscriberSpecs } from '../schemas/newsletter-subscriber.zod.js';

const newsletterSubscriberSchema = new mongoose.Schema<NewsletterSubscriberSpecs>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email address'
      ],
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('newsletter-subscriber', newsletterSubscriberSchema);
