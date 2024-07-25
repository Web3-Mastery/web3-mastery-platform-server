// dependency imports

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import log from './utils/logger.js';
import newsletterRouter from './domains/newsletter/routes/newsletter.router.js';
import authRouter from './domains/user/routes/auth.router.js';
import userRouter from './domains/user/routes/user.router.js';
import platformRouter from './domains/platform/routes/platform.router.js';

// import all types here
import type { Request, Response } from 'express';

// dependency inits
const app = express();

dotenv.config();
// app.use(cors());

app.use(
  cors({
    credentials: true,
    origin: [
      'https://web3mastery.org',
      'https://www.web3mastery.org',
      'https://stage.web3mastery.org',
      'https://web3mastery.vercel.app',
      'http://localhost:3000'
    ],
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// configure .env
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
}

if (process.env.NODE_ENV === 'staging') {
  dotenv.config({ path: '.env.stage' });
}

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
}

// utils import
import dbConnector from './db/connect-db.js';

// @ts-ignore
app.get('/', (req: Request, res: Response) => {
  res.status(200).send({
    responseMessage: 'Welcome to the Web3 Mastery API server',
    response: {
      apiStatus: 'OK'
    }
  });
});

// user end-points - all routed
app.use('/api/v1/newsletter-subscription', newsletterRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/platform', platformRouter);

const port = process.env.PORT || 5000;

const start = async () => {
  const decodeDB_URI = process.env.DB_URI;

  try {
    log.info(`Establishing database connection...`);
    const dbConnection = await dbConnector(decodeDB_URI);
    dbConnection &&
      log.info(
        `...................................\nConnected to: ${dbConnection?.connection.host} 
        \nDatabase connected successfully \n........................................................`
      );
    // console.log(process.env.JWT_SECRET);
    app.listen(port, () => log.info(`Server is listening on port ${port}.`));
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message);
    }
  }
};

// serve

start();
