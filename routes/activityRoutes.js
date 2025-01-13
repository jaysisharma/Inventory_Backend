import express from 'express';
import { getActivitiesController } from '../controllers/activityController.js';

const router = express.Router();

// Route to fetch activities
router.get('/', getActivitiesController);

export default router;
