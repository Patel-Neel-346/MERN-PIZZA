# Base Image Node
FROM node:18

# Working Direction where all code 
WORKDIR /usr/src/app

# copy package && package-lock.json
COPY package*.json ./

# install node_modules
RUN npm install

# Copy all Code in Docker working direc
COPY . .

# Expose Port That you want to run your application
EXPOSE 5501

# Command for execution or run 
CMD ["npm","run","dev"]

