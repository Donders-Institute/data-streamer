#!/bin/bash

# since this script is started from a cronjob, the path and environment variables are emtpy
# set the correct path and ensure modules are available
source /opt/optenv.sh

echo ===============================================================================
echo = COPY TO PROJECT
echo ===============================================================================

/opt/cluster/external/utilities/bin64/rsync -arp odin:/ctfmeg/odin/data/meg/ACQ_Data/* /project/3010102.04/raw/ && \
chmod -R g-w /project/3010102.04/raw/* && \
chmod -R o-w /project/3010102.04/raw/*

retval=$?
if [ $retval -gt 0 ]; then
echo COPY FAILED
exit $retval
fi

