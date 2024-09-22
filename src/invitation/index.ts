import express, { Request, Response, NextFunction } from 'express';
import Invitation from '../models/invitation';
import logger from '../logger';
import Name from '../models/name';

const router = express.Router();

// define the home page route
router.get('/:inviter', async (req: Request, res: Response) => {
    if (!req.params.inviter) {
        res.json([]);
        return;
    }
    const inviterName = await Name.findOne({
        username: req.params.inviter
    });
    if (!inviterName)
    {
        res.json([]);
        return;
    }
    const invitations = await Invitation.find({
        inviter: inviterName._id
    })
        .populate('inviter')
        .populate('invitee').exec();
    res.json(invitations);
})
// define the about route
router.post('/', async (req: Request, res: Response) => {
    const inviter = req.body.inviter;
    const invitee = req.body.invitee;
    if (!invitee || !invitee)
    {
        res.status(400).send({
            message: 'Should fill inviter/invitee'
        });
        return;
    }
    const names = await Name.find({username: [inviter, invitee]});
    const data = {
        ...req.body,
        invitee: names.find(item => item.username === invitee)?._id,
        inviter: names.find(item => item.username === inviter)?._id,
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