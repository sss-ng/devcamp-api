const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");

const logger = require("./middleware/logger");
const bootcamps = require("./routes/bootcamps");
const connectDB = require("./config/db");
const errorHandler = require('./middleware/error')

const app = express();

// Body Parser
app.use(express.json())

// load env vars
dotenv.config({ path: "./config/config.env" });

// connect to database
connectDB();

// use morgan logging if in development mode
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// mount routers
app.use("/api/v1/bootcamps", bootcamps);

// use middleware error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}` .bold.yellow));

// handle a failed connection to the database
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
