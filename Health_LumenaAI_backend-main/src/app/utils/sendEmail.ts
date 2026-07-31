import nodemailer from "nodemailer";
import config from "../../config";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

export const sendMail = async (options: EmailOptions) => {
 const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
        user: config.smtp.email,
        pass: config.smtp.pass,
    },
} as any);

  const adminEmail = "mahmudhasan.hb@gmail.com";
  const companyName = "EcomGrove";

  // const transporter = nodemailer.createTransport({
  //   service: "gmail", // Use your email service provider
  //   auth: {
  //     user: adminEmail, // Your email address
  //     pass: process.env.MAIL_PASS, // Your email password
  //   },
  // });

  const mailOptions = {
    //from: options.from || `"Bisnukhetri" <${config.sendEmail.email_from}>`,
    from: `"no-reply"<${config.smtp.email_from}>`, // Sender address
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.cc && { cc: options.cc }),
    ...(options.bcc && { bcc: options.bcc }),
    ...(options.attachments && { attachments: options.attachments }),
  };

  const res = await transporter.sendMail(mailOptions);
  return res;
};

// Helper function to create the email wrapper (optional)
export const createEmailTemplate = (content: string, logoUrl?: string) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const defaultLogo =
    "https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png";

  return `
  <div style="max-width: 600px; margin: 0 auto; background-color: #000721; color: #333; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <div style="padding: 5px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <img src="${
              logoUrl || defaultLogo
            }" alt="logo" style="height: 40px; margin-bottom: 16px;" />
          </div>
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>
    ${content}
  </div>
  `;
};

// Example usage for OTP
export const sendOTPEmail = async (to: string, otp: number | string) => {
  const content = `
    <h2 style="text-align: center; color: #ffffff;">Verify Your OTP Within 10 Minutes</h2>
    <div style="padding: 0 1em;">
      <p style="text-align: center; line-height: 28px; color: #fff;">
        <strong style="color: #ffffff; font-size: 24px;">${otp}</strong>
      </p>
    </div>
  `;

  return sendMail({
    to,
    subject: "Verify Your OTP within 10 Minutes",
    html: createEmailTemplate(content),
  });
};

// Example usage for password reset
export const sendPasswordResetEmail = async (
  to: string,
  resetPassLink: string
) => {
  const clickableResetPass = `<a href="${resetPassLink}" style="color: #121849; text-decoration: underline;">here</a>`;
  const content = `
    <h2 style="text-align: center; color: #ffffff;">Reset Your Password Within 10 Minutes</h2>
    <div style="padding: 0 1em;">
      <p style="text-align: left; line-height: 28px; color: #fff;">
        <strong style="color: #ffffff;">Reset Link:</strong> Click ${clickableResetPass} to reset your password.
      </p>
    </div>
  `;

  return sendMail({
    to,
    subject: "Reset Your Password",
    html: createEmailTemplate(content),
  });
};
