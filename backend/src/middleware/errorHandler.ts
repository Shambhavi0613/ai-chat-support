import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../types";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err.message);

  const response: ErrorResponse = {
    error: "Internal Server Error",
    message: err.message || "Something went wrong. Please try again.",
  };

  res.status(500).json(response);
}

export function validateChatInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { message } = req.body;

  // Reject empty messages
  if (!message || typeof message !== "string" || message.trim() === "") {
    res.status(400).json({
      error: "Bad Request",
      message: "Message cannot be empty.",
    });
    return;
  }

  // Truncate very long messages
  if (message.length > 2000) {
    req.body.message = message.substring(0, 2000);
  }

  next();
}