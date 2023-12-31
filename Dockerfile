FROM node:latest
EXPOSE 3000
WORKDIR /app

COPY entrypoint.sh /app/
COPY package.json /app/
COPY server.js /app/

RUN apt-get update &&\
    npm install

ENTRYPOINT [ "node", "server.js" ]
