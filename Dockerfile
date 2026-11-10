FROM node:24-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
USER node
EXPOSE 8080
CMD ["node", "main.mjs"]
