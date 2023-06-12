FROM node:19.5.0-alpine

WORKDIR /link-saver-api

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]