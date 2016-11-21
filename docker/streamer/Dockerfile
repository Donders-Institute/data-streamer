FROM centos:7

# install required packages from YUM repository
RUN ( yum -y install wget gcc gcc-c++ \
                     make autoconf git zlib zlib-devel \
                     openssl openssl-devel openssl-libs \
                     sssd-client which \
                     curl curl-devel libxml2-devel epel-release )

RUN ( yum -y install supervisor )

# create temporary directory
RUN ( mkdir -p /tmp )
WORKDIR /tmp

# install python 2.7.12
ADD https://www.python.org/ftp/python/2.7.12/Python-2.7.12.tgz /tmp 
RUN ( tar xvf Python-2.7.12.tgz \
      && cd Python-2.7.12 \
      && ./configure --prefix=/opt/python \
      && make && make install && rm -rf /tmp/Python-* )

ADD https://dl.bintray.com/pycurl/pycurl/pycurl-7.43.0.tar.gz /tmp 
RUN ( tar xvf pycurl-7.43.0.tar.gz \
      && cd pycurl-7.43.0 \
      && /opt/python/bin/python setup.py --with-nss install && rm -rf pycurl-* )

# install python pip
 RUN ( wget https://bootstrap.pypa.io/get-pip.py && \
       /opt/python/bin/python get-pip.py )

# install devcron
RUN ( yum -y install mercurial )
RUN ( /opt/python/bin/pip install -e hg+https://bitbucket.org/dbenamy/devcron#egg=devcron )

# install Cheetah template engine
RUN ( wget https://pypi.python.org/packages/cd/b0/c2d700252fc251e91c08639ff41a8a5203b627f4e0a2ae18a6b662ab32ea/Cheetah-2.4.4.tar.gz#md5=853917116e731afbc8c8a43c37e6ddba && tar xvzf Cheetah-2.4.4.tar.gz && \
      cd Cheetah-2.4.4 && /opt/python/bin/python setup.py install )

# install nodejs
ADD https://nodejs.org/dist/v4.4.7/node-v4.4.7-linux-x64.tar.xz /tmp
RUN ( tar xf node-v4.4.7-linux-x64.tar.xz && mv node-v4.4.7-linux-x64 /opt/nodejs )

# install streamer package 
RUN ( mkdir -p /opt/streamer )

WORKDIR /opt/streamer
COPY package.json package.json
RUN ( /opt/nodejs/bin/npm install )
COPY *.js ./
COPY bin ./bin
COPY lib ./lib
COPY start_streamer.sh start_streamer.sh
RUN ( chmod +x start_streamer.sh )

# supervisor configuration
COPY supervisord.conf /opt/streamer/supervisord.conf

# run devcron from supervisor
VOLUME [ "/project", "/cron", "/opt/streamer/config", "/opt/streamer/log" ]

# main executable
CMD [ "/usr/bin/supervisord", "-c", "/opt/streamer/supervisord.conf" ]
