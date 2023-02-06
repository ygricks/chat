FROM node:18.14.0-alpine3.16

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
