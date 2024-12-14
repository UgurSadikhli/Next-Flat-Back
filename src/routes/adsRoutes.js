import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

router.get('/ads', async (req, res) => {
    await db.read();
    res.json(db.data.ads);
});

router.post('/ads', async (req, res) => {
    const newAd = req.body;
    await db.read();
    const ads = db.data.ads;
    newAd.id = ads.length ? ads[ads.length - 1].id + 1 : 1;
    ads.push(newAd);
    await db.write();
    res.json(newAd);
});

export default router;
