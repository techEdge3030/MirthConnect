FROM --platform=linux/amd64 node:16-alpine AS build
WORKDIR /apps/frontend
COPY . .

RUN npm i
RUN npm run preprod-build
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
CMD npm rebuild esbuild & npm run serve


FROM docker.io/nextgenhealthcare/connect:4.4.1
COPY --from=build /apps/frontend/dist/ /opt/connect/public_html/
# ENTRYPOINT ["/entrypoint.sh"]
# USER mirth
# WORKDIR /opt/connect
# CMD ["./mcserver"]
