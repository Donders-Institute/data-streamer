## Streamer agent service for FieldLine OPM

### How it works

The agent listens on a local socket file `/tmp/streamer.sock` and takes each line of the data sent to the socket file as a FieldLine raw data file to be streamed.

The agent then uploads the raw data file to the [streamer-ftp server](/streamer-ftp) using the `sftp` protocol. After that, it triggers [the streamer service](/streamer/lib/modalityOPM.js) to distribute the uploaded file to the corresponding project storage and the data repository collection.

When processing each raw data file, the agent assumes the naming convention

```
*/HEDscan/recordings/{PRJ}/sub-{SUB}/{DATE}_{TIME}_sub-{SUB}_file-{SES}_raw.fif
```

to parses the variables:

- acquisition date `{DATE}`
- acquisition time `{TIME}`
- project number `{PRJ}`
- subject number `{SUB}`
- session number `{SES}`

The file (and the associated channels file) is then uploaded to the steamer-ftp server in the destination directory

```
/project/3055060.02/raw/{YEAR}/{DATE}/{PRJ}/sub-{SUB}/ses-opm{SES}
```

where `{YEAR}` is the first four digits of `{DATE}`.

### Build Debian package

The build machine requires `dh_make` to be installed.

```bash
$ cd streamer-agent-opm-1.0
$ dh_make --indep --createorig
$ dpkg-buildpackage -us -uc
```

Once the package is installed, the [mandatory environment variables](streamer-agent.cfg) in `/etc/streamer-agent.cfg` should be adjusted accordingly.

### Streamer agent client

A very simple client is `nc` (netcat).  Here is an example:

```bash
$ echo '/home/administrator/HEDscan/recordings/babyopm/sub-emptyroom/20240215_111755_sub-emptyroom_file-hpicoils_raw.fif' | nc -q 0 -U /tmp/streamer.sock
```
