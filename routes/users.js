const User = require("../models/User");
const express = require("express");
const router = express.Router();
const {
  userLogin,
  userSignup,
  getUser,
  updateUser,
  getBooks,
  getFollowingPosts,
  follow,
  getAllUsers,
} = require("../controllers/userController");
const {
  createPost,
  getSignature,
  getPost,
  likePost,
  postComment,
  getAllPosts,
} = require("../controllers/postController");
const auth = require("../middlewares/auth");
const verify = require("../middlewares/verify");
require("../config/passport");
//user signup.
router.post("/signUp", userSignup);
//user login.
router.post("/login", userLogin);
//user verify.
router.get("/verify", auth, verify);
//get user.
router.get("/user", auth, getUser);
//update user.
router.put("/updateUser/:id", auth, updateUser);
//get user specific books.
router.get("/user/books", auth, getBooks);
// user creates a post.
router.post("/user/post", auth, createPost);
// get a cloudinary Signature.
router.get("/user/getSignature", auth, getSignature);
// add post to the database.
router.post("/user/createPost", auth, createPost);
// fetches all the posts of a user.
router.get("/user/getPost", auth, getPost);
// follow a person.
router.post("/user/follow", auth, follow);
// get latest posts of all the people your user is following.
router.get("/user/followingPosts", auth, getFollowingPosts);
// like a post.
router.get("/user/like/:postId", auth, likePost);
// post comment.
router.post("/user/comment/:postId", auth, postComment);
// get all the posts in the database but according to timestamp.
router.get("/user/getAllPosts", auth, getAllPosts);
// get all users in the database according to the max followers.
router.get("/getAllUsers", auth, getAllUsers);
module.exports = router;
