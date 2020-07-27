interface Config {
  mail: {
    settings:
      | {
          host: string;
          port: number;
          secure: boolean;
        }
      | { service: string };
    auth: { user: string; pass: string };
    address: string;
  };

  kindleMail: string;
  kindleToSendTag: string;
  kindleSentTag: string;
  pinboardToken: string;
  title: string;
  rawDataFolder: string;
}

const service = process.env.MAIL_SERVICE ?? "";
const user = process.env.MAIL_USER ?? "";
const pass = process.env.MAIL_PASS ?? "";
const address = process.env.FROM_MAIL ?? "";
let mail;
if (service != null) {
  mail = { address, auth: { user, pass }, settings: { service } };
} else {
  const host = process.env.MAIL_HOST ?? "";
  const port = parseInt(process.env.MAIL_PORT ?? "465", 10);
  const secure = !!process.env.MAIL_SECURE || port === 465;
  mail = { address, auth: { user, pass }, settings: { host, port, secure } };
}
const kindleMail = process.env.TO_MAIL ?? "";

const pinboardToken = process.env.PINBOARD_TOKEN ?? "";
const kindleToSendTag = process.env.TO_SEND_TAG ?? "";
const kindleSentTag = process.env.SENT_TAG ?? "";
const title = process.env.TITLE ?? "Weekly digest";
const rawDataFolder = process.env.RAW_DATA_FOLDER ?? "/tmp/";

export const config: Config = {
  mail,
  kindleMail,
  kindleSentTag,
  kindleToSendTag,
  pinboardToken,
  title,
  rawDataFolder,
};
