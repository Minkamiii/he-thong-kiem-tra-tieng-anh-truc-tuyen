# --- Step 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Step 2: Run ---
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

RUN mkdir -p uploads/images && chmod -R 777 uploads

RUN chown -R node:node /app/uploads
EXPOSE 8000
CMD ["node", "dist/main"]