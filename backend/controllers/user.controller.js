import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  // Get the username from the URL
  const { username } = req.params;

  try {
    // Find the user by username and exclude the password field
    const user = await User.findOne({ username }).select('-password');

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getUserProfile: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Follow or unfollow a user
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    // Check if the user is trying to follow themselves
    // MongoDB에서 _id 필드는 기본적으로 ObjectId 타입이며, 일반적인 문자열(String)과 직접 비교할 수 없습니다.
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if the user exists
    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is already following
    const isFollowing = currentUser.following.includes(id);

    // unfollow
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // TODO: retrun the id of the user as a response
      res.status(200).json({ message: 'User unfollowed successfully' });
    }
    // follow
    else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      const newNotification = new Notification({
        type: 'follow',
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      // TODO: retrun the id of the user as a response
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    console.log('Error in followUnfollowUser: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
  } catch (error) {}
};
