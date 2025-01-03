import cron from "node-cron";
import supabase from "../supabase.js";
import admin from "../firebaseAdmin.js";
import { DateTime } from "luxon";

const TIMEZONE = "IST"; // or the timezone your users prefer

// Run every minute
cron.schedule(
  "* * * * *",
  async () => {
    try {
      console.log("Running scheduler...");
      // 1) get current time/day
      const now = DateTime.now().setZone(TIMEZONE);
      const currentDay = now.toFormat("cccc"); // "Monday", "Tuesday"...
      const currentTime = now.toFormat("HH:mm"); // "08:00"

      // 2) fetch reminders that might be due
      const { data: reminders, error } = await supabase
        .from("medicine_reminders")
        .select("*, user_id ( fcm_token )"); // or do a join to get user.fcm_token
      // Alternatively: just fetch everything, or store day/time in the DB for filtering

      if (error) {
        console.error("Error fetching reminders:", error);
        return;
      }

      // 3) filter in memory for due reminders
      const dueReminders = [];
      for (const r of reminders) {
        if (r.time === currentTime && r.days.includes(currentDay)) {
          dueReminders.push(r);
        }
      }

      // 4) send push notifications
      for (const reminder of dueReminders) {
        // retrieve user fcm token
        // If your supabase join is not set up, do a separate query
        // or if you have user_id.fcm_token as a nested object, parse that
        const fcmToken = reminder.user_id?.fcm_token;
        if (!fcmToken) {
          continue; // no token means can't send push
        }

        // Compose the notification
        const message = {
          notification: {
            title: "Medication Reminder",
            body: `It's time to take ${reminder.name} (${reminder.dosage})`,
          },
          token: fcmToken,
        };

        try {
          const response = await admin.messaging().send(message);
          console.log("Sent FCM notification:", response);
        } catch (sendErr) {
          console.error("Error sending FCM:", sendErr);
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err);
    }
  },
  {
    timezone: TIMEZONE,
  }
);
