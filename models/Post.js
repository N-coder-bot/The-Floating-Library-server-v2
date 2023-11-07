const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PostSchema = new Schema({
  content: { type: String, required: true },
  image: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: mongoose.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.ObjectId, ref: "User" },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  user: { type: mongoose.ObjectId, ref: "User" },
});

module.exports = model("Post", PostSchema);
