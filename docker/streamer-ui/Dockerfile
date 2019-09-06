# Build the static files
FROM node:10 as BUILD
WORKDIR /usr/src/app
COPY $pwd/ui/package.json ./ 
COPY $pwd/ui/yarn.lock ./
RUN yarn install
COPY $pwd/ui/tsconfig.json ./ 
COPY $pwd/ui/*.js ./ 
COPY $pwd/ui/src ./src
COPY $pwd/ui/public ./public
RUN yarn build

# Create the server
FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=build /usr/src/app/build /usr/src/app/frontend
EXPOSE 9000
CMD [ "node", "app.js" ]