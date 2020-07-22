import nodemailer from "nodemailer";
import { config } from "./config";

export async function sendEpub(subject: string, epub: string) {
  const transporter = nodemailer.createTransport({
    ...config.mail.settings,
    auth: config.mail.auth,
  });

  const info = await transporter.sendMail({
    from: config.mail.address,
    to: config.kindleMail,
    subject,
    text: "",
    attachments: [{ path: epub }],
  });

  console.log("Message sent: %s", info.messageId);
}
