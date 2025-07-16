FROM node:18-alpine as builder

WORKDIR /app

COPY package.json ./

# only install dependecies form package.json
RUN npm ci

# copy code
COPY . .

# build
RUN npm run build


# secound stage
FROM node:18-alpine as production

ENV NODEENV=prod 

WORKDIR /app

COPY package*.json ./

# igonre scripts and only install Depencies
RUN npm ci --ignore-scripts 

COPY --from=builder /app/dist ./

EXPOSE 5501 

CMD ["node","src/server.js"]










