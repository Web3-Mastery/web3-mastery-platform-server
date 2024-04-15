import { createNewsletterSubscription } from '../lib/newsletter.createSubscription.service.js';
import nodemailer from 'nodemailer';
const createSubscription = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'email not provided',
                responseMessage: 'please provide a valid email address'
            });
        }
        const newSubscriber = await createNewsletterSubscription(email);
        if (newSubscriber) {
            const subscribedEmail = newSubscriber.email;
            const transporter = nodemailer.createTransport({
                service: process.env.ADMIN_EMAIL_SERVICE,
                auth: {
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_EMAIL_APP_PASSWORD
                }
            });
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: subscribedEmail,
                subject: 'Thanks For Subscribing To The Web3 Mastery Newsletter',
                html: `<p>GM friend, <br/><br/> Great to have you join the Web3 Mastery Newsletter. <br/><br/>
    Web3 Mastery is a web3 education platform that aims to help build the next
    generation of blockchain developers and web3 netizens. <br/> Thanks so much for becoming a part of the story.<br/> <br/>

    Going forward, you'll receive one value-packed newsletter directly from Web3 Mastery every new week.<br/><br/>

    I am confident that you'll love every bit of it, and soon begin to anticipate the weekly publications. 

    Thanks a lot. <br/><br/>

    Best regards, <br/><br/>
    <strong>- Andrew James Okpainmo(for Web3 Mastery)</strong><br/><br/>
    `
            };
            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    return res.status(200).json({
                        responseMessage: 'newsletter subscription created successfully',
                        response: {
                            subscriber: newSubscriber
                        }
                    });
                }
                return;
            });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            const errorString = error.message;
            if (errorString.includes('email_1 dup key: { email:')) {
                return res.status(400).json({
                    responseMessage: 'duplicate newsletter-subscriber email detected',
                    error: 'email already exist on another subscriber: please attempt your subscription with a different email'
                });
            }
            else {
                console.log(error);
                return res.status(500).json({
                    responseMessage: 'newsletter subscription failed: please try again',
                    error: error.message
                });
            }
        }
        else {
            return res.status(500).json({
                responseMessage: 'newsletter subscription failed: please try again',
                error: error
            });
        }
    }
    return;
};
export default createSubscription;
