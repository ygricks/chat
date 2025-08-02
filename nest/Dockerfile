FROM node:22.17-alpine3.22

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
