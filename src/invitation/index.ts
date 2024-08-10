import express, { Request, Response, NextFunction } from 'express';
import Invitation from '../models/invitation';
import logger from '../logger';

const router = express.Router();

// define the home page route
router.get('/:inviter', async (req: Request, res: Response) => {
    if (!req.params.inviter) {
        res.json([]);
        return;
    }
    const invitations = await Invitation.find({
        inviter: req.params.inviter
    }).exec()
    res.json(invitations);
})
// define the about route
router.post('/', async (req: Request, res: Response) => {
    const data = {
        ...req.body,
        createdAt: Date.now()
    }
    try {
        const result = await Invitation.create(data);
        res.json(result);
    } catch (err: any) {
        logger.error(err);
        let statusCode = 500;
        if (err?.code === 11000) {
            statusCode = 400;
        } else if (err?.name === "ValidationError") {
            statusCode = 400;
        }
        res.status(statusCode).send(err);
    }
})

export default router;