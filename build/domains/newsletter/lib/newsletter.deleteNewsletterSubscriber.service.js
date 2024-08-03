import newsletterSubscriberModel from '../models/newsletter-subscriber.model.js';
export async function deleteNewsletterSubscriber(data) {
    try {
        const { email, id, subscriptionToken } = data;
        if (email) {
            const newsletterSubscriber = await newsletterSubscriberModel.deleteOne({
                email
            });
            // console.log(user);
            return newsletterSubscriber;
        }
        if (id) {
            const newsletterSubscriber = await newsletterSubscriberModel.deleteOne({ _id: id });
            return newsletterSubscriber;
        }
        if (subscriptionToken) {
            const newsletterSubscriber = await newsletterSubscriberModel.deleteOne({ subscriptionToken: subscriptionToken });
            return newsletterSubscriber;
        }
        return;
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
