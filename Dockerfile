# #Build stage
# FROM node:lts-alpine3.19 AS build

# WORKDIR /app

# COPY package*.json .

# RUN npm install

# COPY . .

# RUN npm run build

# #Production stage
# FROM node:lts-alpine3.19 AS production

# WORKDIR /app

# COPY package*.json .

# RUN npm ci --only=production

# COPY --from=build /app/dist ./dist

# CMD ["node", "dist/server.js"]

################ BUN IMAGE example  #################

# FROM oven/bun:1.1.7-alpine AS base

# WORKDIR /usr/src/app

# # install dependencies into temp directory
# # this will cache them and speed up future builds
# FROM base AS install
# RUN mkdir -p /temp/dev
# COPY package.json bun.lockb /temp/dev/
# RUN cd /temp/dev && bun install --frozen-lockfile

# # install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# # copy node_modules from temp directory
# # then copy all (non-ignored) project files into the image
# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# # [optional] tests & build
# ENV NODE_ENV=production
# # RUN bun test
# # RUN bun run build

# # copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/server.ts .
# COPY --from=prerelease /usr/src/app/package.json .

# # run the app
# USER bun
# # EXPOSE 3000/tcp
# # ENTRYPOINT [ "bun", "server.ts" ]
# ENTRYPOINT [ "bun", "run", "server.ts" ]

################## BUN IMAGE example 2 ###################

FROM oven/bun:1.1.7-alpine

WORKDIR /usr/src/app

COPY package.json bun.lockb ./

ENV NODE_ENV=production

RUN bun install

COPY . .

ENTRYPOINT [ "bun", "server.ts" ]