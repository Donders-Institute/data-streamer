FROM node:10 AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1-alpine
EXPOSE 80
COPY --from=build /usr/src/app/build /usr/share/nginx/html