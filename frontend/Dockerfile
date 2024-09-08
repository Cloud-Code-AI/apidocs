FROM node:18-alpine AS builder

 
# USER node
 
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# WORKDIR /app
COPY frontend/package.json /home/node/app/
RUN npm install --legacy-peer-deps
COPY frontend/. /home/node/app
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l" , "3000"]
