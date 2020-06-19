# Build the static files
FROM node:12 as BUILD
WORKDIR /opt/streamer-ui-client
COPY $pwd/packages/client/package.json ./ 
COPY $pwd/packages/client/yarn.lock ./
RUN yarn install
COPY $pwd/packages/client/tsconfig.json ./
COPY $pwd/packages/client/.eslintrc.json ./
COPY $pwd/packages/client/*.less ./ 
COPY $pwd/packages/client/*.js ./ 
COPY $pwd/packages/client/src ./src
COPY $pwd/packages/client/public ./public
ARG REACT_APP_STREAMER_UI_MOCK_AUTH
ARG REACT_APP_STREAMER_UI_MOCK_PROJECT_DATABASE
ARG REACT_APP_STREAMER_UI_INTERNAL_SERVER_API_URL
ARG REACT_APP_STREAMER_UI_EXTERNAL_SERVER_API_URL
RUN yarn build

# Create the server
FROM node:12
ENV NODE_ENV production
RUN apt-get update && apt-get install -y cron curl supervisor
WORKDIR /opt/streamer-ui-server
COPY $pwd/packages/server/package.json ./
COPY $pwd/packages/server/yarn.lock ./
RUN yarn install
COPY $pwd/packages/server/supervisord.conf ./
COPY $pwd/packages/server/purge-db.sh ./
COPY $pwd/packages/server/purge-all-db.sh ./
COPY $pwd/packages/server/start-server.sh ./
COPY $pwd/packages/server/*.js ./
COPY $pwd/packages/server/bin ./bin
COPY $pwd/packages/server/routes ./routes
COPY $pwd/packages/server/config ./config
RUN ( chmod +x purge-db.sh )
RUN ( chmod +x purge-all-db.sh )
RUN ( chmod +x start-server.sh )
COPY --from=build /opt/streamer-ui-client/build /opt/streamer-ui-server/frontend
CMD [ "/usr/bin/supervisord", "-c", "/opt/streamer-ui-server/supervisord.conf" ]