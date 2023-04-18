FROM node:18.14.1-alpine
WORKDIR /app
RUN apk update && apk upgrade && \
	apk add --no-cache bash git
COPY package.json .
COPY . .
EXPOSE 8080
CMD yarn start