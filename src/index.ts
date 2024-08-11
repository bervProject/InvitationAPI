import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import logger from './logger';
import app from './app';

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECTION_STRING || '').then(() => {
  logger.info("MongoDB Connected!");
  app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error(err);
})


