const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();

const io = require("socket.io")(server, {
  cors: {
    origin: "https://the-floating-library-v2-m22b.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: `${process.env.cloud_name}`,
  api_key: `${process.env.api_key}`,
  api_secret: `${process.env.api_secret}`,
  secure: true,
});

//set middlewares for request parsing.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = process.env.url || 8000;
//middlewares for view engine setup.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const corsOptions = {
  origin: [
    "https://the-floating-library-v1-1um73wo1a-n-coder-bot.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
//connect to mongodb.
require("./config/database");
//initialising passport.
app.use(passport.initialize());
require("./config/passport")(passport);
const homeRouter = require("./routes/home");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");
io.on("connection", (socket) => {});
app.get("/signup", (req, res) => {
  res.render("addUser");
});
app.use("/", homeRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

server.listen(PORT, () => console.log(`listening on port ${PORT}`));
