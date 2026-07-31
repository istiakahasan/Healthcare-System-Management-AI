import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  backend_base_url: process.env.BACKEND_BASE_URL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "12",
  otp_expiry_time: process.env.OTP_ACCESS_EXPIRES_IN || "5",
  tax_code: process.env.TAX_CODE,
  imageUrl: process.env.IMAGE_URL,
  oauth: {
    google_client_id: process.env.GOOGLE_CLIENT_ID,
  },
  jwt: {
    access_secret: process.env.JWT_SECRET,
    gen_salt: process.env.GEN_SALT,
    access_token_expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.EMAIL_PASSWORD,
  },
  stripe: {
    secretKey: process.env.STRIPE_SK,
    publishableKey: process.env.STRIPE_PK,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twilio: {
    twilio_id: process.env.TWILIO_ID,
    twilio_token: process.env.TWILIO_TOKEN,
    twilio_number: process.env.TWILIO_PHONE_NUMBER,
  },
  brevo: {
    brevo_api_key: process.env.BREVO_API_KEY,
  },
  otpSecret: {
    signup_otp_secret: process.env.SIGNUP_OTP_SECRET,
    verify_otp_secret: process.env.VERIFY_OTP_SECRET,
    reset_password_secret: process.env.RESET_PASSWORD_SECRET,
    forget_password_secret: process.env.FORGET_PASSWORD_SECRET,
  },
  S3: {
    accessKeyId: process.env.S3_ACCESS_KEY || "DO002RGDJ947DJHJ9WDT",
    secretAccessKey:
      process.env.S3_SECRET_KEY ||
      "e5+/pko6Ojar51Hb8ojUKfq2HtXy+tnGKOfs3rIcEfo",
    region: process.env.S3_REGION || "nyc3",
    bucketName: process.env.S3_BUCKET_NAME || "smtech-space",
    endpoint: process.env.S3_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  },
  sendEmail: {
    email_from: process.env.EMAIL_FROM,
    brevo_pass: process.env.BREVO_PASS,
    brevo_email: process.env.BREVO_EMAIL,
  },
  smtp: {
    email: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
    email_from: process.env.SMTP_EMAIL_FROM,
    host: process.env.SMTP_HOST,
    name: process.env.SMTP_NAME,
    port: process.env.SMTP_PORT,
  },
};
