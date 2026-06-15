FROM node:22-alpine

WORKDIR /app

# Required for Expo web
RUN apk add --no-cache git

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npm", "run", "web"]
