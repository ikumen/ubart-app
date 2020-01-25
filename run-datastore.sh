#!/bin/bash

# Source in shared run environment variables
. .run-env

# Our app targets the Python 3 App Engine runtime, but the datastore emulator 
# runs on Python 2, so we're switching over to Python 2 here.
# Note: we are assuming you've got pyenv (https://github.com/pyenv/pyenv),
# if not, you'll need to make sure the shell running this has Python 2 available.
pyenv shell 2.7.14

# Make the data directory if it doesn't already exists
mkdir -p $DATASTORE_DATA

# Start the datastore emulator
# https://cloud.google.com/datastore/docs/tools/datastore-emulator
gcloud beta emulators datastore start \
  --data-dir=$DATASTORE_DATA \
  --host-port="$DATASTORE_HOST:$DATASTORE_PORT"

