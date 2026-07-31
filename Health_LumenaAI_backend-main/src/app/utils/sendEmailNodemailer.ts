import nodemailer from "nodemailer";
import config from "../../config";

// const sendEmail = async (
//   to: string,
//   subject: string,
//   html: string,
//   text?: string
// ) => {
//   // Create a transporter
//   const transporter = nodemailer.createTransport({
//     // host: "smtp.protonmail.ch",
//     host: "mail.hasanmajedul.com",
//     // service: "gmail",
//     port: 465,
//     secure: true,
//     auth: {
//       user: config.emailSender.email,
//       pass: config.emailSender.app_pass,
//       // user: "support@deepbluedeal.com",
//       // pass: "W21DY4ASM5BPP19B",
//     },
//     tls: {
//       rejectUnauthorized: false,  // Optional: Bypass SSL issues if needed
//     },
//   });

//   // Email options
//   const mailOptions = {
//     from: config.emailSender.email,
//     // from: "support@deepbluedeal.com",
//     to,
//     subject,
//     html,
//     text,
//   };
//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;

// Bishnu Client
let sendEmail = async (
  emailTo: string,
  EmailSubject: string,
  EmailHTML?: string,
  EmailText?: string,
) => {
  // For Zeptomail, you need to format the credentials differently
  let transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      // Zeptomail format: <token>$<sender-email>
      user: "emailapikey",
      // Your API key is the password
      pass: "PHtE6r1ZR+66im8v8kJU4vOxEpbxN9sqqOtvfVVEsd5FXPUFF01Rr99/lmOxrxYsVKRAF6adzo5vsbzI4bmNcWu5NWsYW2qyqK3sx/VYSPOZsbq6x00YtVsSd0bUUoHvctBo0SHUuNnYNA==",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: '"Example Team" <noreply@ableai.ai>',
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
    text: EmailText || EmailHTML?.replace(/<[^>]*>/g, ""), // Fallback text version
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

export default sendEmail;
