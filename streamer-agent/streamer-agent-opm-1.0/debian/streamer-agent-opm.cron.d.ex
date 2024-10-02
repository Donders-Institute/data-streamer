#
# Regular cron jobs for the streamer-agent-opm package
#
0 4	* * *	root	[ -x /usr/bin/streamer-agent-opm_maintenance ] && /usr/bin/streamer-agent-opm_maintenance
