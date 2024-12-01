import fs from 'fs';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../logger';
import name from '../models/name';

dotenv.config();

async function loadData() {
    const readSample = fs.readFileSync('sample.csv');
    const records = parse(readSample, {
        columns: true,
    });
    if (Array.isArray(records)) {
        for (const record of records) {
            logger.info(`Load: ${JSON.stringify(record)}`);
            const result = await name.findOneAndUpdate({username: record.username}, {
                username: record.username,
                name: record.name,
                createdAt: Date.now()
            }, {
                upsert: true,
                returnNewDocument: true,
                new: true
            });
            logger.info(`Saved: ${result?._id}. Result: ${JSON.stringify(result)}`);
        }
    }
}

async function startLoader() {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');
    logger.info("MongoDB Connected!");
    await loadData();
}

export default startLoader;
