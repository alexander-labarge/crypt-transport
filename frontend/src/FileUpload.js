import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import './styles.css';

const FileUpload = () => {
  const [fileName, setFileName] = useState('');
  const [aesGenerated, setAesGenerated] = useState({
    key: '',
    iv: '',
    salt: '',
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:5002/config')
      .then(response => {
        formik.setValues(response.data);
      })
      .catch(error => {
        console.error('Error fetching config:', error);
      });
  }, []);

  const generateAesKeys = (password, cipherMode) => {
    axios.post('http://127.0.0.1:5002/generate_keys', { password, cipher_mode: cipherMode })
      .then(response => {
        setAesGenerated({
          key: response.data.key,
          iv: response.data.iv || '',
          salt: response.data.salt || '',
        });
        formik.setFieldValue('aesKey', response.data.key);
        formik.setFieldValue('aesIV', response.data.iv || '');
        formik.setFieldValue('aesSalt', response.data.salt || '');
      })
      .catch(error => {
        console.error('Error generating AES keys:', error);
      });
  };

  const formik = useFormik({
    initialValues: {
      file: null,
      sshUsername: '',
      sshPassword: '',
      sshKey: '',
      sshPort: '',
      sshEndpoint: '',
      clientCert: '',
      clientKey: '',
      serverCert: '',
      serverKey: '',
      serverBindIP: '',
      fileInfoPort: '',
      fileChunksPort: '',
      uploadDir: '',
      downloadDir: '',
      compressionFormat: '',
      cipherMode: 'aes-256-cbc', // Default value
      aesPassword: '',
      aesKey: '',
      aesIV: '',
      aesSalt: '',
      encryptedChunkSize: '',
      destinationPath: '',
    },
    validationSchema: Yup.object({
      file: Yup.mixed().required('A file is required'),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      for (let key in values) {
        if (key !== 'file') {
          formData.append(key, values[key]);
        }
      }
      formData.append('file', values.file);
  
      axios.post('http://127.0.0.1:5002/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('File uploaded successfully:', response.data);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="container my-4">
      <div className="form-inner-wrapper">
        <div className="file-upload-wrapper">
          <input
            type="file"
            id="file"
            name="file"
            onChange={(event) => {
              formik.setFieldValue('file', event.currentTarget.files[0]);
              setFileName(event.currentTarget.files[0].name);
            }}
          />
          <label htmlFor="file">Choose File</label>
          {fileName && <div className="file-name">{fileName}</div>}
          {formik.errors.file && <div className="text-danger">{formik.errors.file}</div>}
        </div>

        <h3>SSH Configuration</h3>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>SSH Username</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="sshUsername"
              value={formik.values.sshUsername}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>SSH Password</label>
            <input
              type="password"
              className="form-control fixed-size"
              name="sshPassword"
              value={formik.values.sshPassword}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>SSH Key</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="sshKey"
              value={formik.values.sshKey}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>SSH Port</label>
            <input
              type="number"
              className="form-control fixed-size"
              name="sshPort"
              value={formik.values.sshPort}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>SSH Endpoint</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="sshEndpoint"
              value={formik.values.sshEndpoint}
              onChange={formik.handleChange}
            />
          </div>
        </div>

        <h3>mTLS Configuration</h3>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Client Certificate</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="clientCert"
              value={formik.values.clientCert}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>Client Private Key</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="clientKey"
              value={formik.values.clientKey}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Server Certificate</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="serverCert"
              value={formik.values.serverCert}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>Server Private Key</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="serverKey"
              value={formik.values.serverKey}
              onChange={formik.handleChange}
            />
          </div>
        </div>

        <h3>Encryption Configuration</h3>
        <div className="form-row">
          <div className="form-group col-md-4">
            <label>Cipher Mode</label>
            <select
              className="form-control fixed-size"
              name="cipherMode"
              value={formik.values.cipherMode}
              onChange={formik.handleChange}
            >
              <option value="aes-256-cbc">AES-256-CBC</option>
              <option value="aes-256-ecb">AES-256-ECB</option>
              <option value="aes-256-cfb">AES-256-CFB</option>
              <option value="aes-256-ofb">AES-256-OFB</option>
              <option value="aes-256-xts">AES-256-XTS</option>
            </select>
          </div>
          <div className="form-group col-md-4">
            <label>Password</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="aesPassword"
              value={formik.values.aesPassword}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-4 button-container">
            <button
              type="button"
              className="btn btn-red"
              onClick={() => generateAesKeys(formik.values.aesPassword, formik.values.cipherMode)}
            >
              Generate AES Keys
            </button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-4">
            <label>Key</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="aesKey"
              value={aesGenerated.key || formik.values.aesKey}
              onChange={formik.handleChange}
            />
          </div>
          {formik.values.cipherMode !== 'aes-256-xts' && (
            <>
              <div className="form-group col-md-4">
                <label>IV</label>
                <input
                  type="text"
                  className="form-control fixed-size"
                  name="aesIV"
                  value={aesGenerated.iv || formik.values.aesIV}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Salt</label>
                <input
                  type="text"
                  className="form-control fixed-size"
                  name="aesSalt"
                  value={aesGenerated.salt || formik.values.aesSalt}
                  onChange={formik.handleChange}
                />
              </div>
            </>
          )}
        </div>

        <h3>Transport Configuration</h3>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Encrypted Chunk Size</label>
            <input
              type="number"
              className="form-control fixed-size"
              name="encryptedChunkSize"
              value={formik.values.encryptedChunkSize}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label>Destination Path</label>
            <input
              type="text"
              className="form-control fixed-size"
              name="destinationPath"
              value={formik.values.destinationPath}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Upload</button>
      </div>
    </form>
  );
};

export default FileUpload;
