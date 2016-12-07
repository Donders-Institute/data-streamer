#!/bin/bash

cd /opt/streamer
/opt/nodejs/bin/node --expose-gc --max-old-space-size=2048 streamer.js
