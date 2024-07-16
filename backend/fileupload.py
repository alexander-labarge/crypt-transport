"""File Upload Server"""

import os
import json
import subprocess
import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Parse command line arguments
parser = argparse.ArgumentParser(description="File Upload Server")
parser.add_argument('--debug', action='store_true', help="Enable debug mode")
parser.add_argument('--ip', type=str, default='0.0.0.0', help="IP address to run the server on")
args = parser.parse_args()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
CONFIG_FOLDER = os.path.join(BASE_DIR, 'config')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONFIG_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONFIG_FOLDER'] = CONFIG_FOLDER
CONFIG_PATH = os.path.join(app.config['CONFIG_FOLDER'], 'config.json')

if args.debug:
    print("Config path:", CONFIG_PATH)


def read_config():
    """Read configuration from the JSON file."""
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        if args.debug:
            print(f"Error decoding JSON from config file: {e}")
        return {}


def save_config(data):
    """Save configuration to the JSON file."""
    try:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as config_file:
            json.dump(data, config_file, indent=4)
        return CONFIG_PATH
    except (IOError, TypeError) as e:
        if args.debug:
            print(f"Error saving config file: {e}")
        return None


def save_file(file):
    """Save uploaded file to the upload folder."""
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(file_path)
        return file_path
    except IOError as e:
        if args.debug:
            print(f"Error saving file: {e}")
        return None


@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and update configuration."""
    if args.debug:
        print("Received POST request at /upload")

    if 'file' not in request.files:
        if args.debug:
            print("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        if args.debug:
            print("No selected file")
        return jsonify({'error': 'No selected file'}), 400

    file_path = save_file(file)
    if not file_path:
        if args.debug:
            print("Failed to save file")
        return jsonify({'error': 'Failed to save file'}), 500

    data = request.form.to_dict()
    if args.debug:
        print("Form data received:", data)

    config = read_config()
    config.update(data)

    if not save_config(config):
        if args.debug:
            print("Failed to save config file")
        return jsonify({'error': 'Failed to save config file'}), 500

    if args.debug:
        print("File uploaded and config saved successfully")
    return jsonify({'message': 'File uploaded and config saved successfully'}), 200


@app.route('/config', methods=['GET'])
def get_config():
    """Return the current configuration."""
    try:
        config = read_config()
        return jsonify(config), 200
    except (IOError, json.JSONDecodeError) as e:
        if args.debug:
            print(f"Error reading config: {e}")
        return jsonify({'error': f'Error reading config: {e}'}), 500


@app.route('/generate_keys', methods=['POST'])
def generate_keys():
    """Generate encryption keys based on the provided password and cipher mode."""
    password = request.json.get('password')
    cipher_mode = request.json.get('cipher_mode')
    if not password:
        return jsonify({'error': 'Password is required to generate keys'}), 400
    if not cipher_mode:
        return jsonify({'error': 'Cipher mode is required'}), 400

    try:
        if cipher_mode == 'aes-256-xts':
            key_size = 64  # 512 bits
            result = subprocess.run(
                ['openssl', 'rand', '-hex', str(key_size)],
                capture_output=True, text=True, check=True
            )
            key = result.stdout.strip()
            response = {
                'key': key,
                'iv': None,
                'salt': None
            }
        else:
            result = subprocess.run(
                ['openssl', 'enc', f'-{cipher_mode}', '-P', '-k', password],
                capture_output=True, text=True, check=True
            )
            output = result.stdout.strip()
            response = {}
            for line in output.split('\n'):
                key, value = line.split('=')
                response[key.lower().strip()] = value.strip()
            if 'iv' not in response:
                response['iv'] = None

        return jsonify(response), 200
    except subprocess.CalledProcessError as e:
        if args.debug:
            print(f"Subprocess error: {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        if args.debug:
            print(f"Unexpected error: {e}")
        return jsonify({'error': f'Unexpected error: {e}'}), 500


if __name__ == '__main__':
    app.run(host=args.ip, port=5005, debug=args.debug)