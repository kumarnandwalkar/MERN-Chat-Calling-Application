# In MERN-Chat-Calling-Application/client/Dockerfile

# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# --- THIS IS THE KEY PART ---
# The build command is now simple. No IP addresses needed!
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# We don't need the custom nginx.conf here,
# because the service in docker-compose.yaml doesn't use this container.
# This container is just a "builder" and a "holder" of static files.
# ... wait, no, the nginx.conf from the user is for the client.
# My proxy solution is better. The user's `nginx.conf` was trying to
# make the client *also* the proxy, which is messy.
# My solution uses a *separate* Nginx container as the main proxy.
# The client/Dockerfile should still copy its *own* nginx config
# so that it can serve the React app correctly.

# Let's re-evaluate.
# The user's `client/Dockerfile` builds the app and puts it in an Nginx container.
# The user's `nginx.conf` is for *that* Nginx container.
# My `docker-compose.yaml` (from step 1) is wrong. It assumes the `client`
# service *is* the React app, but the user's Dockerfile *produces* an Nginx container.

# --- LET'S CORRECT THE PLAN ---
# The user's setup is a 2-Nginx setup.
# 1. An Nginx container for the client (from `client/Dockerfile`).
# 2. My proposed Nginx container (the reverse proxy).
# This is redundant. We can use just ONE Nginx container.

# --- NEW, SIMPLER, CORRECTED PLAN ---
# We will combine the `client` and `nginx` services.

### 1. (Corrected) `docker-compose.yaml` (Production File)

This is much cleaner. The `client` service *is* the Nginx proxy.

```yaml
# In MERN-Chat-Calling-Application/docker-compose.yaml

services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db

  server:
    build: ./server
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongo:27017/mern_chat
      - JWT_SECRET=aDefaultSecretKeyForYourOrchestratorPleaseChange
    # NO PORTS - The client proxy will handle it
    depends_on:
      - mongo

  client:
    build:
      context: ./client
      # NO ARGS NEEDED
    volumes:
      # Mount the Nginx config with proxy rules
      - ./client/nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      # This is the ONLY port your app exposes
      - "8080:80"
    depends_on:
      - server

volumes:
  mongo_data:
