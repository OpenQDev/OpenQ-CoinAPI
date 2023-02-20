FROM node:19.6.1-alpine
WORKDIR /app
RUN apk update && apk upgrade && \
	apk add --no-cache bash git
COPY package.json .
RUN yarn
COPY . .
EXPOSE 8080
ENTRYPOINT yarn start