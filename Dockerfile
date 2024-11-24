FROM node:22 as build
# Create app directory
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk add --no-cache git && corepack enable && yarn install --immutable
COPY . .
RUN yarn build

FROM node:22-alpine as runner
WORKDIR /app
COPY --from=build /app/lib /app/lib
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --immutable --production && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]