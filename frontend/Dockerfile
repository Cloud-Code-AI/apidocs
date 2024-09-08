# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the app
RUN npm run build

# Install a simple HTTP server to serve the static content
RUN npm install -g http-server

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["http-server", "dist", "-p", "3000"]