FROM node:22-alpine AS builder
ARG DATABASE_URL

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Build the application
RUN yarn build

# ==========================================================

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 9000

CMD ["node", "dist/main.js"]

