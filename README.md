# Crypt-Transport Secure File Upload Server

Crypt-Transport is a secure file upload server and client built with Python, Javascript, and C for Cryptographic Performance. It supports uploading files, updating configuration settings, and generating encryption keys. The server uses JSON for configuration management and can handle AES encryption. Current dev effort: augment pre-existing data per chunk encryption layer and configure networking and automation.

## Table of Contents

- [Crypt-Transport Secure File Upload Server](#crypt-transport-secure-file-upload-server)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
    - [Development Mode](#development-mode)
    - [Production Mode](#production-mode)
  - [API Endpoints](#api-endpoints)
    - [Upload File](#upload-file)
    - [Get Configuration](#get-configuration)
    - [Generate Keys](#generate-keys)
  - [Project Structure](#project-structure)
  - [Example Usage](#example-usage)
    - [Uploading a File](#uploading-a-file)
    - [Generating AES Keys](#generating-aes-keys)
  - [Debugging](#debugging)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- File upload handling with secure file saving.
- Configuration management using JSON files.
- AES key generation for encryption.
- TODO: 
- Transport Operations:
-  Qemu Interfaces
-  SSH Remote Config
-  mTLS Client and Server Config
-  Integrate existing per chunk AES logic for data transport

## Prerequisites

Ensure you have the following installed:

- Python 3.7 or higher
- `pip` (Python package installer)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/crypt-transport.git
cd crypt-transport/backend
```

2. Create a virtual environment and activate it:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install the required packages:

```bash
pip install -r requirements.txt
```

## Running the Server

### Development Mode

To run the server in development mode with debug logs:

```bash
python fileupload.py --debug
```

### Production Mode

To run the server in production mode without debug logs:

```bash
python fileupload.py
```

By default, the server will run on `0.0.0.0:5005`.

## API Endpoints

### Upload File

**POST /upload**

Uploads a file and updates the configuration.

- Request:
  - `file`: The file to be uploaded.
  - Other form data to update configuration.

- Response:
  - Success: `200 OK`
  - Error: `400 Bad Request` or `500 Internal Server Error`

### Get Configuration

**GET /config**

Retrieves the current configuration.

- Response:
  - Success: `200 OK` with JSON configuration
  - Error: `500 Internal Server Error`

### Generate Keys

**POST /generate_keys**

Generates encryption keys based on the provided password and cipher mode.

- Request:
  - `password`: Password for key generation.
  - `cipher_mode`: Cipher mode for key generation (e.g., `aes-256-cbc`).

- Response:
  - Success: `200 OK` with generated keys
  - Error: `400 Bad Request` or `500 Internal Server Error`

## Project Structure

```
crypt-transport/
│
├── backend/
│   ├── config/
│   │   └── config.json
│   ├── uploads/
│   ├── venv/
│   ├── fileupload.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── README.md
│   ├── package.json
│   └── package-lock.json
├── README.md
├── run.sh
└── setup.sh
```

## Example Usage

### Uploading a File

Use a tool like `curl` or Postman to upload a file.

```bash
curl -X POST -F "file=@/path/to/your/file.txt" -F "sshUsername=yourUsername" http://0.0.0.0:5005/upload
```

### Generating AES Keys

```bash
curl -X POST -H "Content-Type: application/json" -d '{"password": "yourPassword", "cipher_mode": "aes-256-cbc"}' http://0.0.0.0:5005/generate_keys
```

## Debugging

To enable debug mode, use the `--debug` flag when running the server. This will print detailed logs to the console, which can help in diagnosing issues.

```bash
python fileupload.py --debug
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```

This README provides a comprehensive overview of the Crypt-Transport project, including installation instructions, running the server, API endpoints, and debugging information.