import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/errors/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import handleWebHook from "./app/webhooks/stripe.webhook";
import cron from "node-cron";
import { sendShiftNotification } from "./app/helpers/sendShiftNotification";

const app: Application = express();
const prisma = new PrismaClient();
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:4030",
    "http://206.162.244.175:4030",
    "http://206.162.244.175:4031",
    "http://localhost:4031",
    "http://localhost:4032",
    "http://206.162.244.175:4032",
    "http://206.162.244.175:4031",
    "http://31.97.115.183:4031",
    "http://31.97.115.183:4032",
    "https://ableai.ai",
    "https://dashboard.ableai.ai",
    "https://dashboard.ableai.ai/login",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Send Notification to staff for their upcoming shifts
const NotifyStaffForShift = async () => {
  try {
    const notificationsToSend = await prisma.shift.findMany({
      where: {
        startDateTime: {
          lte: new Date(Date.now() + 60 * 60000), // 1 hour from now
        },
        isNotified: false,
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
        carePlan: {
          include: {
            patient: true,
          },
        },
      },
    });

    for (const shift of notificationsToSend) {
      if (
        !shift.staff ||
        !shift.staff.user ||
        !shift.carePlan ||
        !shift.carePlan.patient
      ) {
        continue;
      }
      await sendShiftNotification({
        receiverId: shift.staff.user.id,
        staffName: `${shift.staff.user.firstName} ${shift.staff.user.lastName}`,
        patientName: `${shift.carePlan.patient.firstName} ${shift.carePlan.patient.lastName}`,
        type: "REMINDER",
      });

      await prisma.shift.update({
        where: {
          id: shift.id,
        },
        data: {
          isNotified: true,
        },
      });
      console.log("Notification sent to :", shift.staff.user.firstName);
    }
    console.log("🔔 Notifications to send:", notificationsToSend.length);
  } catch (error: any) {
    console.error("Error fetching shifts for notifications:", error);
  }
};

cron.schedule("* * * * *", () => {
  // runs every minute
  NotifyStaffForShift();
});
// Middleware setup
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((error: any) => {
    console.error("Failed to connect to the database:", error);
  });
app.use(
  "/api/v1/stripe/payment-webhook",
  express.raw({ type: "application/json" }),
  handleWebHook,
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "3000mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "3000mb",
    parameterLimit: 100000,
  }),
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads")),
);

// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Welcome to Bisnukhetri server...",
  });
});

app.get("/payment", (req: Request, res: Response) => {
  res.render("stripe");
});
// Router setup
app.use("/api/v1", router);

// Global Error Handler
app.use(GlobalErrorHandler);

// API Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
