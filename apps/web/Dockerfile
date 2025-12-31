FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
