FROM node:22-alpine as build
# Create app directory
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN apk add --no-cache git && corepack enable && yarn install --immutable
COPY . .
RUN yarn build

FROM node:22-alpine as runner
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --immutable && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]