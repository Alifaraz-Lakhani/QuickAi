# 1. Use a lightweight Node.js image
FROM node:20-alpine

# 2. Create and set the working directory
WORKDIR /app

# 3. Copy package files first (helps with Docker caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the server code
COPY . .

# 6. Expose the port the Express server listens on
EXPOSE 3000

# 7. Start the application
CMD ["npm", "start"]
