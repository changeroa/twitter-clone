import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
  try {
    console.log('getting it');
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    console.log('userId :', userId);
    console.log('text :', text);
    console.log('img :', img);
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!text && !img)
      return res.status(400).json({ error: 'Post must have text or image' });

    // if (img) {
    //   const uploadedResponse = await cloudinary.uploader.upload(img);
    //   img = uploadedResponse.secure_url;
    // }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log('Error in createPost controller: ', error.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    console.log(post.user.toString(), req.user._id.toString());
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: 'You are not authorized to delete this post' });
    }

    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params._id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.log('Error in deletePost controller: ', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text)
      return res.status(400).json({ error: 'Comment cannot be empty' });

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log('Error in commentOnPost controller: ', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.params.id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.log('post :', post);
    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });

      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      post.likes.push(userId);
      await post.save();
    }

    const notification = new Notification(
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['follow', 'like'],
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    );
    await notification.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.log('Error in likeUnlikePost controller: ', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
