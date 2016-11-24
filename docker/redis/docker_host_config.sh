#!/bin/bash

###########################################################################################
#  This script needs to be executed on the Docker host to make kernel-level configurations
#  propagated to the container in which Redis runs, for performance issue.
###########################################################################################

## Disable THP support
echo never > /sys/kernel/mm/transparent_hugepage/enabled

## memory overcommit 
sysctl vm.overcommit_memory=1
