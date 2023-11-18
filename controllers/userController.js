const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//user login controller.
const userLogin = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(401).json({ success: false, msg: "could not find user" });
  }
  const isValidPassword = await user.isValidPassword(req.body.password);
  if (isValidPassword) {
    const expiresIn = "1d";
    const payload = {
      sub: user._id,
      iat: Date.now(),
    };
    const signedToken = jwt.sign(payload, `${process.env.secretOrKey}`, {
      expiresIn,
    });
    res.json({ token: "Bearer " + signedToken, expiresIn });
  } else {
    res
      .status(401)
      .json({ success: false, msg: "you entered the wrong password" });
  }
};

//signup user controller.
const userSignup = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.create(data);
    res.json({ success: true });
  } catch (error) {
    // console.log(error);
    res.status(400).json({ error: "ALREADY EXISTS!" });
  }
};

//get user controller.
const getUser = async (req, res) => {
  res.json({ user: req.user });
};

//update user.
const updateUser = async (req, res) => {
  try {
    let newUsername = req.body.username;
    let newPassword = req.body.password;
    let user = req.user;
    let updatedUser = undefined;
    let canModify = !(await bcrypt.compare(newPassword, user.password));
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    //1. case  when there is no new username but there is a new Password.
    if (
      newPassword !== "" &&
      canModify &&
      (newUsername === user.username || newUsername === "")
    ) {
      updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { password: hash },
        { new: true }
      );
    }
    //2. case when the password is same but username is different.
    else if (
      (!canModify || newPassword === "") &&
      newUsername !== user.username &&
      newUsername !== ""
    ) {
      updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { username: newUsername },
        { new: true }
      );
    }
    //3. else when both are different.
    else {
      updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { username: newUsername, password: hash },
        { new: true }
      );
    }
    //send successfully updated message.
    res.json({ updateUser, msg: "sucess" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "ALREADY EXISTS!" });
  }
};

//get user specific books.
const getBooks = async (req, res) => {
  const user = req.user;
  await User.populate(user, {
    path: "books",
    populate: [{ path: "genre" }, { path: "author" }],
  });
  // console.log(user.books);
  res.json(user.books);
};

// Follow or unfollow a person.
const follow = async (req, res) => {
  const personToBeFollowed = req.body.id;
  // console.log(personToBeFollowed);
  const currentUser = req.user;

  // Check if the current user is already following the person
  const isFollowing = currentUser.following.includes(personToBeFollowed);

  if (isFollowing) {
    // If already following, unfollow the person
    await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { following: personToBeFollowed } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      personToBeFollowed,
      { $pull: { followers: currentUser._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ success: true, msg: "Unfollowed successfully", follow: false });
  } else {
    // If not following, follow the person
    await User.findByIdAndUpdate(
      currentUser._id,
      { $push: { following: personToBeFollowed } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      personToBeFollowed,
      { $push: { followers: currentUser._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ success: true, msg: "Followed successfully", follow: true });
  }
};

// get posts of the person you are following.
const getFollowingPosts = async (req, res) => {
  try {
    const currentUser = req.user;
    const followingIds = currentUser.following;
    const { limit, skip } = req.query;
    const followingPosts = await Post.find({ user: { $in: followingIds } })
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("user", "username profilePicture")
      .exec();

    res.status(200).json({ success: true, posts: followingPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch following posts" });
  }
};
// get all users based on max number of followers.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { _id: { $nin: req.user.following } },
      ],
    }) // excluding current User.
      .populate("followers")
      .sort({ followers: -1 })
      .exec();
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// add profile photo.
const addProfilePhoto = async (req, res) => {
  const { image } = req.body;
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: image },
      { new: true }
    );
    res.status(200).json({ success: "success" });
  } catch (error) {
    res.status(500).json({ success: "failure" });
  }
};
module.exports = {
  userLogin,
  userSignup,
  getUser,
  updateUser,
  getBooks,
  follow,
  getFollowingPosts,
  getAllUsers,
  addProfilePhoto,
};
