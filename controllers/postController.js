const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Add Post
exports.createPost = async (req, res) => {
  try {
    const { content, image, likes } = req.body;

    const newPost = new Post({
      content,
      image,
      user: req.user._id,
    });

    newPost.timestamp = new Date();

    // Save the new post to the database
    await newPost.save();

    // Update the posts array of the user with the new post's _id
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: newPost._id } },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Post added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add post" });
  }
};
// get All Posts in the database according to timestamp.
exports.getAllPosts = async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("user", "username profilePicture")
      .exec();
    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

// get cloudinary signature for the post.
exports.getSignature = (req, res, next) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = `${process.env.api_secret}`;
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "images",
    },
    apiSecret
  );
  res.send({ timestamp, signature });
  next();
};

// get all posts of the current user.
exports.getPost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts").exec();
    const posts = user.posts;
    res.status(201).send({ posts });
  } catch (error) {
    res.status(401).send({ error });
  }
};
// Like or unlike a post.
exports.likePost = async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    res.status(200).json({ msg: "Unliked successfully" });
  } else {
    await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: req.user._id } },
      { new: true }
    );

    res.status(201).json({ msg: "Liked successfully" });
  }
};

// post a comment.
exports.postComment = async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  const timestamp = Math.round(new Date().getTime() / 1000);
  // console.log(req.body.comment);
  await Post.findByIdAndUpdate(
    postId,
    {
      $push: {
        comments: {
          user: req.user._id,
          text: req.body.comment,
          timestamp,
        },
      },
    },
    { new: true }
  );

  res
    .status(201)
    .json({ msg: "commented successfully", comment: req.body.comment });
};
