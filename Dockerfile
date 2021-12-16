# syntax=docker/dockerfile:1

FROM node:16

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 3444

CMD [ "npm", "start" ]