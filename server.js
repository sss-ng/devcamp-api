// load env vars
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const path = require("path");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");

const app = express();

// Body Parser
app.use(express.json());

// connect to database
connectDB();

// use morgan logging if in development mode
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// file uploading
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

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
