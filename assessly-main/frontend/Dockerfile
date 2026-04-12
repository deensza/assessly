FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install deps
RUN npm ci

# Copy app code
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
