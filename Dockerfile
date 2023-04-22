FROM node

WORKDIR /link-saver-api

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]