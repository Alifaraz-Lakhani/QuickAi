# 1. Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies FIRST (Good for caching)
COPY package*.json ./
# Use --mount for npm cache optimization (requires BUILDKIT)
RUN --mount=type=cache,target=/root/.npm npm install

# NOW Copy the rest of the source code
COPY . .

# IMPORTANT: These must come AFTER 'COPY . .' but BEFORE 'RUN npm run build'
# This ensures Vite picks them up during the bundling process.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Verify the variable is set (Optional: helps you see it in the build logs)
RUN echo "Building with key: $VITE_CLERK_PUBLISHABLE_KEY"

RUN npm run build

# 2. Production stage
FROM nginx:stable-alpine
# Verify your vite config output folder is 'dist' (standard for Vite)
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]