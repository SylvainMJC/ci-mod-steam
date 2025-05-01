FROM node:18-alpine

WORKDIR /app

LABEL maintainer="Developer"
LABEL description="Application Node.js pour interagir avec Steam Workshop API"

COPY package*.json ./

RUN npm ci --only=production

COPY . .

VOLUME [ "/app/output" ]

ENV APP_SCRIPT=getUserSummary.js

CMD ["sh", "-c", "node ${APP_SCRIPT}"] 