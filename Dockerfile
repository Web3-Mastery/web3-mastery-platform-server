# node base-image
FROM node:20-alpine

# setting working directory to the "/app" dir in docker
WORKDIR /app

# copy package.json into "/app" dir - i.e the working dir inside docker
COPY package*.json ./

# install all dependencies from the package.json
RUN npm install

# copy in all our files from the build folder - into the working directory on docker
COPY /build .

# set port
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]