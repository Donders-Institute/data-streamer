#!/bin/bash

# TODO: these three performance setting doesn't not take place in this way!! To be fixed.
sysctl -w net.core.somaxconn=65535
sysctl vm.overcommit_memory=1
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# start the redis-server
redis-server --protected-mode no --appendonly yes
