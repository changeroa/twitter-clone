import express from 'express';
import { get } from 'mongoose';
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUserProfile,
} from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.post('/update', protectRoute, updateUserProfile);

export default router;
