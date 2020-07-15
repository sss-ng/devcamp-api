const dotenv = require("dotenv");
// load env vars
dotenv.config({ path: "./config/config.env" });

const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const path = require("path");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const app = express();

// Body Parser
app.use(express.json());

// connect to database
connectDB();

// cookie parser
app.use(cookieParser());

// use morgan logging if in development mode
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// file uploading
app.use(fileUpload());

// sanitize
app.use(expressMongoSanitize());

// set security for headers
app.use(helmet());

// prevent xss
app.use(xss());

// rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 100,
});

app.use(limiter);

// prevent http param pollution
app.use(hpp());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

// use middleware error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold.yellow)
);

// handle a failed connection to the database
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
