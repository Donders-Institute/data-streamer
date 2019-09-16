# Build the static files
FROM node:10 as BUILD
WORKDIR /usr/src/app
COPY $pwd/client/package.json ./ 
COPY $pwd/client/yarn.lock ./
RUN yarn install
COPY $pwd/client/tsconfig.json ./
COPY $pwd/client/.eslintrc.json ./
COPY $pwd/client/*.less ./ 
COPY $pwd/client/*.js ./ 
COPY $pwd/client/src ./src
COPY $pwd/client/public ./public
RUN yarn build

# Create the server
FROM node:10
WORKDIR /usr/src/app
COPY $pwd/server/package*.json ./
RUN npm install
COPY $pwd/server/*.js ./
COPY $pwd/server/routes ./routes
COPY $pwd/server/views ./views
COPY $pwd/server/config ./config
COPY --from=build /usr/src/app/build /usr/src/app/frontend
EXPOSE 9000
CMD [ "node", "app.js" ]
