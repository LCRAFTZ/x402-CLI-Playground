# Multi-stage build for x402 CLI
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY bin ./bin
COPY src ./src
COPY vitest.config.ts jest.config.cjs ./
RUN npm install && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/bin ./bin
ENV NODE_ENV=production
ENV X402_HOST=0.0.0.0
EXPOSE 4020
CMD ["node", "./bin/x402.js", "serve", "--facilitator", "mock", "--endpoint", "/content", "--pay-to", "mock-payee", "--port", "4020"]