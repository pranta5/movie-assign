import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { dbConnect } from "./app/config/dbConfig";

import { authRouter } from "./app/routers/auth.routes";
import { userRouter } from "./app/routers/user.routes";
import { movieRouter } from "./app/routers/movie.routes";
import { theatreRouter } from "./app/routers/theater.routes";
import { bookingRouter } from "./app/routers/booking.routes";

const app = express();
const port = process.env.PORT || 8000;

// Initialize database
dbConnect();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/movie", movieRouter);
app.use("/api/v1/theater", theatreRouter);
app.use("/api/v1/booking", bookingRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
