<p align="center">
  <a href="https://github.com/christianhans/pinboard-to-kindle">
    <img src="https://imgur.com/rWkJ1Bt.jpg" alt="Raspberry Pi and Kindle" width="400">
  </a>

  <h3 align="center">Pinboard to Kindle</h3>

  <p align="center">
    Calibre recipe for sending unread Pinboard bookmarks to your Kindle.
  </p>
  
  <p align="center">
  ➡️ <a href="https://christianhans.info/12791/running-your-own-read-later-service-with-raspberry-pi-and-pinboard">Build your personal Read Later Service using Raspberry Pi!</a>
  </p>
</p>

## Table of Contents

- [Overview](#overview)
- [Running with Docker Compose](#running-with-docker-compose)
  - [Install Docker Compose](#install-docker-compose)
  - [Clone the repository](#clone-the-repository)
  - [Set up docker-compose](#set-up-docker-compose)
    - [Pinboard token](#pinboard-token)
    - [Set up email service](#set-up-email-service)
      - [Well known service](#well-known-service)
      - [Other service](#other-service)
      - [Kindle related configuration](#kindle-related-configuration)
    - [Start the service](#start-the-service)
  - [Interacting with running docker compose](#interacting-with-running-docker-compose)
  - [License](#license)

## Overview

- Leverages a headless Firefox instance and Mozilla's [readability](https://github.com/mozilla/readability) library to fetch clutter- and ad-free article pages.
  - This results in eBooks with articles that look similar to Firefox's Reader View.
  - Pages with dynamic content (e.g. a page that loads images or text via JavaScript) can be fetched correctly.
  - Most images embedded in articles are fetched as well and will be part of the generated eBook.
- Fetches only unread Pinboard bookmarks that have the tag `kindle-to` (per default up to 50 bookmarks).
- When a Pinboard bookmark was successfully fetched, the tag `kindle-to` is replaced with the `kindle-sent` tag.
- App is fully dockerized and easy to set up and configure.

## Running with Docker Compose

Easiest way to run pinboard-to-kindle is with [Docker Compose](https://docs.docker.com/compose/).

### Install Docker Compose

You can install Compose by following [official install guide](https://docs.docker.com/compose/install/).

### Clone the repository

Clone this repository and `cd` into the cloned `pinboard-to-kindle` directory:

```sh
git clone https://github.com/kijowski/pinboard-to-kindle.git
cd pinboard-to-kindle
```

### Set up docker-compose

Copy `docker-compose.sample.yml` to `docker-compose.yml` and modify environment variable inside

#### Pinboard token

Set your Pinboard API token as PINBOARD_TOKEN environment variable in `docker-compose.yml`. Copy your token from [this page](https://pinboard.in/settings/password) and replace `username:A3F...HG78` below with your actual token:

```
  PINBOARD_TOKEN: "username:A3F...HG78"
```

#### Set up email service

There are two ways of setting up mail:

##### Well known service

If your email provider is listed [at nodemailer website](https://nodemailer.com/smtp/well-known/) as a known service you can set MAIL_SERVICE, MAIL_USER, MAIL_PASS and FROM_MAIL environment variables eg:

```
  MAIL_SERVICE: "Gmail"
  MAIL_USER: "example@gmail.com"
  MAIL_PASS: "password"
  FROM_MAIL: "example@gmail.com"
```

You can safely remove MAIL_HOST, MAIL_PORT and MAIL_SECURE variables

##### Other service

If your email provider is not listed as known service you can set it up manually by providing MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT and MAIL_SECURE variables

```
  MAIL_USER: "user"
  MAIL_PASS: "password"
  MAIL_HOST: "smtp.yourmailserver.com"
  MAIL_PORT: "587"
  MAIL_SECURE: "false"
  FROM_MAIL: "example@yourmailserver.com"
```

You can remove `MAIL_SERVICE`

#### Kindle related configuration

Last bit of configuration that you can change is setting kindle email address as TO_MAIL, two tags: TO_SEND_TAG and SENT_TAG that will be managed by pinboard and MAX_ARTICLES which tells how much articles can be bundled in one mobi file

```
  TO_MAIL: "yourkindlemail@kindle.com someothermail@example.com"
  TO_SEND_TAG: "to-send"
  SENT_TAG: "sent"
  MAX_ARTICLES: 10
```

Note that you can use multiple addresses in TO_MAIL by separating them with a whitespace.

### Start the service

After configuration you can start the service with `docker-compose up -d` which will start the service in the background.

From this point on the service should be working and sending you an email every Friday at 8am (this will be pulled into configuration soon)

## Interacting with running docker compose

You can interact with running service by executing commands with `docker-compose exec`.

For example to run the processing you can invoke `docker-compose exec pinboard-to-kindle p2k process`.

Other commands that you can run are `p2k download <url> <destination>` and `p2k send <title> <file>` - you can learn more about them in [cli.ts](/src/cli.ts) file.

## License

Distributed under the MIT License. See `LICENSE` for more information.
