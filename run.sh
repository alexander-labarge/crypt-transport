#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists, destroy it, and recreate it
if [ -d "venv" ]; then
    rm -rf venv
fi

python3 -m venv venv

# Source the virtual environment
source venv/bin/activate

# Install the required Python packages
pip install --upgrade pip
pip install -r requirements.txt

# Run the Flask application in the background
FLASK_APP=fileupload.py flask run --port=5005 &

# Navigate to the frontend directory
cd ../frontend

# Start the frontend application
npm start

# Wait for all background processes to finish
wait
