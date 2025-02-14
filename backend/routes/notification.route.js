import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {
  getNotifications,
  deleteNotifications,
  deleteNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNotifications);
// TODO: Add a route to delete a single notification
router.delete('/:id', protectRoute, deleteNotification);

export default router;
