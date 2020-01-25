#!/bin/bash

# Source the run environment variables
. .run-env

export PYTHONPATH=$PYTHONPATH:.
export FLASK_ENV=development
#export GOOGLE_APPLICATION_CREDENTIALS=$UBARTAPP_CREDENTIALS

# Help our application find the datastore emulator and not the GCP datastore
export DATASTORE_EMULATOR_HOST="$DATASTORE_HOST:$DATASTORE_PORT"

# Start our application
python main.py
