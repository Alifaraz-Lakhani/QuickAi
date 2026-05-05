# 1. Use a lightweight Node.js image
FROM node:20-alpine

# 2. Install curl for healthchecks
RUN apk add --no-cache curl

# 3. Create and set the working directory
WORKDIR /app

# 4. Copy package files first (helps with Docker caching)
COPY package*.json ./

# 5. Install dependencies (with npm cache mount for faster rebuilds)
# RUN --mount=type=cache,target=/root/.npm npm install
RUN npm install

# 6. Copy the rest of the server code
COPY . .

# 7. Expose the port the Express server listens on
EXPOSE 3000

# 8. Start the application
CMD ["npm", "start"]
