#!/bin/bash

# since this script is started from a cronjob, the path and environment variables are emtpy
# set the correct path and ensure modules are available
source /opt/optenv.sh

echo ===============================================================================
echo = CLEANUP
echo ===============================================================================

/usr/sbin/tmpwatch --mtime 168 /project/3010102.04/raw/

retval=$?
if [ $retval -gt 0 ]; then
echo CLEANUP FAILED
exit $retval
fi

