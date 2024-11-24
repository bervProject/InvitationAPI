FROM node:22-alpine as build
# Create app directory
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk add --no-cache git && yarn --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine as runner
WORKDIR /app
COPY --from=build /app/lib /app/lib
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --production && yarn cache clean
RUN adduser -D ia && chown -R ia /app
USER ia
CMD [ "yarn", "start" ]