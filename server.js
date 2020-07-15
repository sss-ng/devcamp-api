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

const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();

// Body Parser
app.use(express.json());

// connect to database
connectDB();

// cookie parser
app.use(cookieParser())

// use morgan logging if in development mode
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// file uploading
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/users", users);

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
