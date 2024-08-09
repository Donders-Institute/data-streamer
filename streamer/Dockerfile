FROM almalinux:8

# application metadata
LABEL donders.ru.nl.app_name "streamer"
LABEL donders.ru.nl.app_maintainer "h.lee@donders.ru.nl"
LABEL donders.ru.nl.app_code_repository "https://github.com/Donders-Institute/data-streamer"

# install required packages from YUM repository
RUN ( ulimit -n 1024 && yum -y install wget gcc gcc-c++ \
      make autoconf git zlib zlib-devel \
      openssl openssl-devel openssl-libs \
      sssd-client which rsync \
      curl curl-devel libxml2-devel epel-release \
   && yum clean all \
   && rm -rf /var/cache/yum/* \
   && rm -rf /tmp/* )

RUN ( ulimit -n 1024 && yum -y install supervisor sshpass pv expect \
   && yum clean all \
   && rm -rf /var/cache/yum/* \
   && rm -rf /tmp/* )

# create temporary directory
RUN ( mkdir -p /tmp )
WORKDIR /tmp

# install nodejs
#ADD https://nodejs.org/dist/v8.12.0/node-v8.12.0-linux-x64.tar.xz /tmp
#RUN ( if [ ! -d node-v8.12.0-linux-x64 ]; then tar xf node-v8.12.0-linux-x64.tar.xz; fi \
#      && mv node-v8.12.0-linux-x64 /opt/nodejs )

ADD https://nodejs.org/dist/latest-v10.x/node-v10.24.1-linux-x64.tar.xz /tmp

RUN ( if [ ! -d node-v10.24.1-linux-x64 ]; then tar xf node-v10.24.1-linux-x64.tar.xz; fi \
      && mv node-v10.24.1-linux-x64 /opt/nodejs && rm -rf /tmp/node-*)

# install streamer package
RUN ( mkdir -p /opt/streamer )

WORKDIR /opt/streamer
COPY package.json package.json
RUN ( export PATH=/opt/nodejs/bin:$PATH && export USER=root && /opt/nodejs/bin/npm install -g node-gyp && /opt/nodejs/bin/npm install -g --unsafe-perm)
COPY *.js ./
COPY bin ./bin
COPY lib ./lib
COPY config ./config
COPY start_streamer.sh start_streamer.sh
RUN ( chmod +x bin/* )
RUN ( chmod +x start_streamer.sh )

# supervisor configuration
COPY supervisord.conf /opt/streamer/supervisord.conf

# run devcron from supervisor
VOLUME [ "/project", "/cron", "/opt/streamer/config", "/opt/streamer/log" ]

# main executable
CMD [ "/usr/bin/supervisord", "-c", "/opt/streamer/supervisord.conf" ]
