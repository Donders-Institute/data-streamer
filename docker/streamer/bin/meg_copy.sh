#!/bin/bash

function print_usage() {

    cat <<EOF

rsync data from MEG console to local drive

Usage:

  $ meg_copy.sh <consoleDir> <consoleUsername> <consolePassword> <localDir>

EOF
}

function get_script_dir() {

    ## resolve the base directory of this executable
    local SOURCE=$1
    while [ -h "$SOURCE" ]; do
        # resolve $SOURCE until the file is no longer a symlink
        DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
        SOURCE="$(readlink "$SOURCE")"

        # if $SOURCE was a relative symlink,
        # we need to resolve it relative to the path
        # where the symlink file was located

        [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
    done

    echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

# check if control file is given
if [ $# -ne 4 ]; then
    print_usage
    exit 1
fi

console_dir=$1
console_user=$2
console_pass=$3
local_dir=$4

f_stderr=/opt/streamer/log/meg_copy.err.$$

mydir=$( get_script_dir $0 )

# retrieve total amount of items to be process by the rsync
total_items=$( rsync -rvpn --rsh="/usr/bin/sshpass -p ${console_pass} ssh -o StrictHostKeyChecking=no -l ${console_user}" \
               ${console_dir}/ ${local_dir}/ | wc -l )

# perform the rsync and monitor the progress (the progress is reported to STDERR)
${mydir}/s-unbuffer rsync -rvp --rsh="/usr/bin/sshpass -p ${console_pass} ssh -o StrictHostKeyChecking=no -l ${console_user}" \
${console_dir}/ ${local_dir}/ 2>${f_stderr} | pv -ln -s ${total_items} > /dev/null

retval=${PIPESTATUS[0]}

if [ $retval -ne 0 ]; then
    # rsync error
    echo "stderr file: ${f_stderr}"
else
    rm -f ${f_stderr}
fi

exit $retval
