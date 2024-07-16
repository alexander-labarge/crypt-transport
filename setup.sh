#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nodejs npm git curl wget vim build-essential libssl-dev libffi-dev python3 python3-dev python3-flask python3-venv python3-pip pipx

# Install Create React App globally
sudo npm install -g create-react-app

# Clone the project from GitHub
git clone https://github.com/alexander-labarge/crypt-transport.git
cd crypt-transport

# Set up virtual environment for the backend
cd backend

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    rm -rf venv
fi

# Create a new virtual environment
python3 -m venv venv

# Source the virtual environment
source venv/bin/activate

# Install the required Python packages
pip install --upgrade pip
pip install -r requirements.txt

# Navigate to the frontend and install npm packages
cd ../frontend
npm install axios react-dropzone formik yup react-router-dom bootstrap react eact-bootstrap

echo "Setup complete. You can now run ./run.sh to start the application."
