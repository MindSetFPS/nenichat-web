FROM oven/bun:1

WORKDIR /app

COPY package.json ./

RUN bun install --production

COPY src ./src
COPY tsconfig.json ./

CMD ["bun", "src/index.ts"]
