import fs from 'fs';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../logger';
import { IName, nameSchema } from '../models/name';

dotenv.config();

async function loadData(connection: mongoose.Connection) {
    const readSample = fs.readFileSync(process.env.IMPORT_FILE ?? 'sample.csv');
    const records = parse<IName>(readSample, {
        columns: true,
    });
    if (Array.isArray(records)) {
        for (const record of records) {
            logger.info(`Load: ${JSON.stringify(record)}`);
            const nameModel = connection.model('Name', nameSchema);
            const result = await nameModel.findOneAndUpdate({username: record.username}, {
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
    const connection = mongoose.createConnection(process.env.MONGO_CONNECTION_STRING || '');
    logger.info("MongoDB Connected!");
    await loadData(connection);
    await connection.destroy();
}

export default startLoader;
