FROM node:22-alpine as build
# Create app directory
WORKDIR /app
COPY . .
RUN apk add --no-cache git && corepack enable && yarn install --immutable && yarn build

FROM node:22-alpine as runner
WORKDIR /app
COPY --from=build /app/lib /app/lib
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --immutable --production && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]