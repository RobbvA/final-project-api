// src/middleware/errorHandler.js
import * as Sentry from "@sentry/node";

export function errorHandler(err, req, res, next) {
  console.error(err);

  // Stuur de error naar Sentry
  Sentry.captureException(err);

  res.status(500).json({
    error: "An error occurred on the server, please double-check your request!",
  });
}
