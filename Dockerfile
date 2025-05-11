FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .


RUN chown -R node:node /app && chmod -R 755 /app

RUN npm install pm2 -g

COPY ecosystem.config.js .

USER node

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
