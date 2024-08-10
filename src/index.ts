import express, { Express, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

import invitation from './invitation';

const app: Express = express();
const port = process.env.PORT || 3000;

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


