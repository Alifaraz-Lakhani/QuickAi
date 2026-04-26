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

# 6. Expose the port your server uses
# (Check your server.js; usually it's 4000 or 5000)
EXPOSE 4000

# 7. Start the application
CMD ["npm", "start"]