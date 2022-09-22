#!/bin/bash

# save environment variables needed by cron jobs
echo "STREAMER_UI_DB_USER=$STREAMER_UI_DB_USER" > /etc/environment
echo "STREAMER_UI_DB_PASSWORD=$STREAMER_UI_DB_PASSWORD" >> /etc/environment

# start cron service
cron -f
