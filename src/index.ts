import express, { Express, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

import invitation from './invitation';

const app: Express = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/invitation', invitation);

mongoose.connect(process.env.MONGO_CONNECTION_STRING || '').then(() => {
  logger.info("MongoDB Connected!");
  app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error(err);
})


