import express, { Request, Response, NextFunction } from 'express';
import Name from '../models/name';

const router = express.Router();

// define the home page route
router.get('/:username', async (req: Request, res: Response) => {
    if (!req.params.username) {
        res.json({});
        return;
    }
    const name = await Name.findOne({
        username: req.params.username
    }).exec()
    res.json(name ?? {});
})

export default router;