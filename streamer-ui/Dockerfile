# Build the static files
FROM node:10 as BUILD
WORKDIR /opt/streamer-ui-client
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
WORKDIR /opt/streamer-ui-server
COPY $pwd/server/package*.json ./
RUN npm install
COPY $pwd/server/start_streamer_ui_server.sh ./
COPY $pwd/server/*.js ./
COPY $pwd/server/bin ./bin
COPY $pwd/server/routes ./routes
COPY $pwd/server/views ./views
COPY $pwd/server/config ./config
RUN ( chmod +x start_streamer_ui_server.sh )
COPY --from=build /opt/streamer-ui-client/build /opt/streamer-ui-server/frontend
CMD [ "/opt/streamer-ui-server/start_streamer_ui_server.sh" ]
