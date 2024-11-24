FROM node:22-alpine as build
ENV YARN_VERSION=4.2.2
# Create app directory
WORKDIR /app
# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
COPY package.json yarn.lock ./
RUN apk add --no-cache git && yarn --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine as runner
ENV YARN_VERSION=4.2.2
WORKDIR /app
COPY --from=build /app/lib /app/lib
COPY package.json yarn.lock ./
# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN yarn --frozen-lockfile --production && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]