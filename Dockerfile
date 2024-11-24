FROM node:22-alpine as build
ENV YARN_VERSION=4.1.1
# Create app directory
WORKDIR /app
# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
COPY package.json yarn.lock ./
RUN apk add --no-cache git && yarn install --immutable
COPY . .
RUN yarn build

FROM node:22-alpine as runner
ENV YARN_VERSION=4.1.1
WORKDIR /app
COPY --from=build /app/lib /app/lib
COPY package.json yarn.lock ./
# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN yarn install --immutable --production && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]