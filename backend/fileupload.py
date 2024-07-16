from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
import subprocess

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
CONFIG_FOLDER = os.path.join(BASE_DIR, 'config')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONFIG_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONFIG_FOLDER'] = CONFIG_FOLDER
config_path = os.path.join(app.config['CONFIG_FOLDER'], 'config.json')
print("Config path:", config_path)

def read_config():
    try:
        with open(config_path, 'r') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        return {}

def save_config(data):
    try:
        with open(config_path, 'w') as config_file:
            json.dump(data, config_file, indent=4)
        return config_path
    except Exception as e:
        print(f"Error saving config file: {e}")
        return None

def save_file(file):
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(file_path)
        return file_path
    except Exception as e:
        print(f"Error saving file: {e}")
        return None

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        print("Received POST request at /upload")  # Debugging line
        if 'file' not in request.files:
            print("No file part in the request")  # Debugging line
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("No selected file")  # Debugging line
            return jsonify({'error': 'No selected file'}), 400
        
        if file:
            file_path = save_file(file)
            if not file_path:
                print("Failed to save file")  # Debugging line
                return jsonify({'error': 'Failed to save file'}), 500
            
            data = request.form.to_dict()
            print("Form data received:", data)  # Debugging line
            config = read_config()
            config.update(data)
            
            config_path = save_config(config)
            if not config_path:
                print("Failed to save config file")  # Debugging line
                return jsonify({'error': 'Failed to save config file'}), 500
            
            print("File uploaded and config saved successfully")  # Debugging line
            return jsonify({'message': 'File uploaded and config saved successfully'}), 200
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/config', methods=['GET'])
def get_config():
    try:
        config = read_config()
        return jsonify(config), 200
    except Exception as e:
        print(f"Error reading config: {str(e)}")
        return jsonify({'error': f'Error reading config: {str(e)}'}), 500

@app.route('/generate_keys', methods=['POST'])
def generate_keys():
    try:
        password = request.json.get('password')
        cipher_mode = request.json.get('cipher_mode')
        if not password:
            return jsonify({'error': 'Password is required to generate keys'}), 400
        if not cipher_mode:
            return jsonify({'error': 'Cipher mode is required'}), 400

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
        print(f"Subprocess error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
