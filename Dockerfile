FROM node:12-slim

RUN apt-get update && apt-get install -y \
    calibre \
    firefox-esr \
    git \
    wget

RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz
RUN tar -xvzf geckodriver*
RUN chmod +x geckodriver
RUN mv geckodriver /usr/local/bin

WORKDIR /app
COPY package.json .
RUN npm install && npm cache clean --force

COPY . .
RUN npm run build
RUN npm link

CMD ["node", "dist/cron.js"]
