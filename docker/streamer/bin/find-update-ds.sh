#!/bin/bash

raw_dir=$1
min_back=$2

find $raw_dir -type f -path '*.ds/*' -mmin -${min_back} | awk -F '.ds' '{print $1".ds"}' | sort | uniq
