FROM node:alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
COPY . /usr/src/bot

RUN npm install
RUN npx prisma generate

RUN npm run deploy
CMD ["npm", "start"]