FROM --platform=linux/amd64 node:16-alpine

WORKDIR /apps/backend

COPY . .

ENV MIRTH_API_URL="https://nextgen-connect.saga-it.com"

RUN npm i

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD npm rebuild esbuild & npm run serve