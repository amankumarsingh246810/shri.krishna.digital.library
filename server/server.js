import "dotenv/config";

import app from "./app.js";
import {connectDB} from "./config/db.js";

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server running on port ${PORT}`
        );

        /*
         * Automatic fee reminders are currently
         * paused.
         *
         * We are using manual notifications from
         * the admin panel for now.
         */
        console.log(
          "🔔 Automatic fee reminders are paused."
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();