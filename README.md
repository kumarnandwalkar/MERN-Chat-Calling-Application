# MERN Chatting & Video Calling App (Containerized)

A full-stack MERN application providing real-time chat and peer-to-peer video calls using WebRTC and Socket.IO. Fully containerized with Docker and ready to deploy to AWS.

## Features
- User authentication (register/login) with JWT
- Real-time 1:1 chat via Socket.IO
- Online presence
- 1:1 video calls via WebRTC (STUN support; TURN pluggable)
- MongoDB persistence for users and messages
- Dockerized services served via Nginx (client) and Express (server)

## Tech
- MongoDB, Express.js, React (Vite), Node.js
- Socket.IO for realtime events
- WebRTC for audio/video
- Docker and Docker Compose

## Quick Start (Docker)

1. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Update `server/.env` and `client/.env` as needed (defaults work locally).

3. Build and run:

```bash
docker compose up --build
```

4. Open the app: `http://localhost:8080`

- API: `http://localhost:5000`
- WebSocket: `ws://localhost:5000` (managed internally by the app)

## Environment Variables

Server (`server/.env`):
- `PORT` (default: 5000)
- `MONGO_URI` (default: mongodb://mongo:27017/mern_chat)
- `JWT_SECRET` (required; set a secure value)
- `CORS_ORIGIN` (default: http://localhost:8080)
- `TURN_URL` (optional; e.g. turn:turn.example.com:3478)
- `TURN_USERNAME` (optional)
- `TURN_CREDENTIAL` (optional)

Client (`client/.env`):
- `VITE_API_URL` (default: http://localhost:5000)
- `VITE_SOCKET_URL` (default: http://localhost:5000)

## AWS Deployment (Overview)

- Option A: Single EC2 instance
  - Install Docker + Docker Compose
  - Configure DNS pointing to the instance
  - Set `CORS_ORIGIN` to your domain (e.g. https://app.example.com)
  - `docker compose -f docker-compose.yml up -d --build`

- Option B: ECS (Fargate)
  - Push client and server images to ECR
  - Provision ECS services (client, server) + a MongoDB (self-managed on EC2 or Atlas)
  - Configure security groups, target groups, and an ALB for `client` and `server`

- TURN server (recommended for production WebRTC reliability):
  - Deploy a coturn server (or use a managed provider)
  - Provide `TURN_URL`, `TURN_USERNAME`, and `TURN_CREDENTIAL` to the server

## Local Development (hot reload)

If you prefer hot reload in development:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This uses bind mounts for the client and server to enable hot reload.

## License
MIT
