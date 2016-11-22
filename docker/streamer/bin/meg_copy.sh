#!/bin/bash

meg_dir=$1
meg_user=$2
meg_pass=$3
streamer_dir=$4

# create destination directory in any case
mkdir -p $streamer_dir > /dev/null 2>&1

rsync -rp --rsh="/usr/bin/sshpass -p $meg_pass ssh -o StrictHostKeyChecking=no -l $meg_user" $meg_dir/* $streamer_dir/ && \
chmod -R g-w $streamer_dir && \
chmod -R o-w $streamer_dir

retval=$?

exit $retval
