import nodemailer from "nodemailer";
import { config } from "./config";
import debug from "debug";

const log = debug("p2k:mail");

export async function sendEpub(subject: string, epub: string) {
  log("Creating email transport for %s", config.mail.address);
  const transporter = nodemailer.createTransport({
    ...config.mail.settings,
    auth: config.mail.auth,
  });

  log("Sending email message to %o", config.kindleMail);
  const info = await transporter.sendMail({
    from: config.mail.address,
    to: config.kindleMail.split(" "),
    subject,
    text: subject,
    attachments: [{ path: epub }],
  });

  log("Message sent: %o", info);
}
