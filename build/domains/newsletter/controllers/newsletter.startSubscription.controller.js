import { createNewsletterSubscription } from '../lib/newsletter.createSubscription.service.js';
import nodemailer from 'nodemailer';
import generateTokens from '../../../utils/generateTokens.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
const createSubscription = async (req, res) => {
    if (req.user) {
        const { subSessionActivityId: sub_session_activity_id } = req.user;
        try {
            const { email } = req.body;
            // const {sub_session_activity_id} = req.user
            if (!email) {
                return res.status(400).json({
                    error: 'email not provided',
                    responseMessage: 'please provide a valid email address'
                });
            }
            const user = await findUser({ email });
            const subscriptionToken = await generateTokens({ tokenType: 'newsletterToken', email: email });
            const subSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id }));
            if (user) {
                const newSubscriber = await createNewsletterSubscription({
                    subscriber: {
                        email: email,
                        isPlatformUser: true,
                        platformUserId: user._id,
                        subscriptionToken: subscriptionToken,
                        sessions: [[{ checkInTime: '0', subSessionActivity: subSessionActivity, sessionId: '1' }]]
                    }
                });
                if (newSubscriber) {
                    const subscribedEmail = newSubscriber.email;
                    // const transporter = nodemailer.createTransport({
                    //   service: process.env.ADMIN_EMAIL_SERVICE,
                    //   auth: {
                    //     user: process.env.ADMIN_EMAIL,
                    //     pass: process.env.ADMIN_EMAIL_APP_PASSWORD
                    //   }
                    // });
                    const web3MasteryClientBaseURL = process.env.WEB3MASTERY_WEBSITE_BASE;
                    const newsletterSubscriptionLink = `${web3MasteryClientBaseURL}/complete-sign-up/?signUpToken=${subscriptionToken}`;
                    const transporter = nodemailer.createTransport({
                        host: process.env.ADMIN_EMAIL_HOST,
                        secure: true,
                        port: 465,
                        auth: {
                            user: process.env.ADMIN_CONTROLLER_EMAIL,
                            pass: process.env.ADMIN_EMAIL_APP_PASSWORD
                        }
                    });
                    const mailOptions = {
                        from: `"Andrew from Web3 Mastery" ${process.env.ADMIN_CONTROLLER_EMAIL}`,
                        to: subscribedEmail,
                        subject: 'Confirm your subscription to the Web3 Mastery newsletter',
                        html: `<p>GM friend, <br/><br/> Great to have you join the Web3 Mastery Newsletter. <br/><br/>
      Web3 Mastery is a web3 education platform that aims to help build the next
      generation of world-class blockchain developers and web3 netizens. <br/> Thanks for choosing to become a part of the story.<br/> <br/>
  
      <br/><br/>
      Let's get you on the mailing list ASAP, but first we'll need you to confirm your subscription with the link below<br/><br/>
      ${newsletterSubscriptionLink}
      <br/><br/>
  
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
                                responseMessage: 'newsletter subscription started successfully',
                                response: {
                                    subscriber: newSubscriber
                                }
                            });
                        }
                        return;
                    });
                }
            }
            else {
                const newSubscriber = await createNewsletterSubscription({
                    subscriber: {
                        email: email,
                        isPlatformUser: false,
                        subscriptionToken: subscriptionToken,
                        sessions: [[{ checkInTime: '0', subSessionActivity: subSessionActivity, sessionId: '1' }]]
                    }
                });
                if (newSubscriber) {
                    const subscribedEmail = newSubscriber.email;
                    // const transporter = nodemailer.createTransport({
                    //   service: process.env.ADMIN_EMAIL_SERVICE,
                    //   auth: {
                    //     user: process.env.ADMIN_EMAIL,
                    //     pass: process.env.ADMIN_EMAIL_APP_PASSWORD
                    //   }
                    // });
                    const subscriptionToken = await generateTokens({ tokenType: 'newsletterToken', email: email });
                    const web3MasteryClientBaseURL = process.env.WEB3MASTERY_WEBSITE_BASE;
                    const newsletterSubscriptionLink = `${web3MasteryClientBaseURL}/complete-sign-up/?signUpToken=${subscriptionToken}`;
                    const transporter = nodemailer.createTransport({
                        host: process.env.ADMIN_EMAIL_HOST,
                        secure: true,
                        port: 465,
                        auth: {
                            user: process.env.ADMIN_CONTROLLER_EMAIL,
                            pass: process.env.ADMIN_EMAIL_APP_PASSWORD
                        }
                    });
                    const mailOptions = {
                        from: `"Andrew from Web3 Mastery" ${process.env.ADMIN_CONTROLLER_EMAIL}`,
                        to: subscribedEmail,
                        subject: 'Confirm your subscription to the Web3 Mastery newsletter',
                        html: `<p>GM friend, <br/><br/> Great to have you join the Web3 Mastery Newsletter. <br/><br/>
      Web3 Mastery is a web3 education platform that aims to help build the next
      generation of world-class blockchain developers and web3 netizens. <br/> Thanks for choosing to become a part of the story.<br/> <br/>
  
      <br/><br/>
      Let's get you on the mailing list ASAP, but first we'll need you to confirm your subscription with the link below<br/><br/>
      ${newsletterSubscriptionLink}
      <br/><br/>
  
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
                                responseMessage: 'newsletter subscription started successfully',
                                response: {
                                    subscriber: newSubscriber
                                }
                            });
                        }
                        return;
                    });
                }
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
    }
    return;
};
export default createSubscription;
