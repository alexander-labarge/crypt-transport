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
      sshUsername: Yup.string().required('SSH Username is required'),
      sshPassword: Yup.string().required('SSH Password is required'),
      sshKey: Yup.string().required('SSH Key is required'),
      sshPort: Yup.string().required('SSH Port is required'),
      sshEndpoint: Yup.string().required('SSH Endpoint is required'),
      clientCert: Yup.string().required('Client Certificate is required'),
      clientKey: Yup.string().required('Client Private Key is required'),
      serverCert: Yup.string().required('Server Certificate is required'),
      serverKey: Yup.string().required('Server Private Key is required'),
      serverBindIP: Yup.string().required('Server Bind IP is required'),
      fileInfoPort: Yup.string().required('File Info Port is required'),
      fileChunksPort: Yup.string().required('File Chunks Port is required'),
      uploadDir: Yup.string().required('Upload Directory is required'),
      downloadDir: Yup.string().required('Download Directory is required'),
      compressionFormat: Yup.string().required('Compression Format is required'),
      aesPassword: Yup.string().required('AES Password is required'),
      aesKey: Yup.string().required('AES Key is required'),
      aesIV: Yup.string().required('AES IV is required'),
      aesSalt: Yup.string().required('AES Salt is required'),
      encryptedChunkSize: Yup.string().required('Encrypted Chunk Size is required'),
      destinationPath: Yup.string().required('Destination Path is required'),
    }),
    onSubmit: (values) => {
      console.log('Submitting form with values:', values); // Debugging line

      const formData = new FormData();
      for (let key in values) {
        if (key !== 'file') {
          formData.append(key, values[key]);
        }
      }
      formData.append('file', values.file);

      axios.post('http://159.89.36.194:5005/upload', formData, {
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

  useEffect(() => {
    axios.get('http://159.89.36.194:5005/config')
      .then(response => {
        console.log('Config data:', response.data); // Debugging line
        formik.setValues(response.data);
      })
      .catch(error => {
        console.error('Error fetching config:', error);
      });
  }, []); // Empty dependency array ensures this effect runs only once

  const generateAesKeys = (password, cipherMode) => {
    axios.post('http://159.89.36.194:5005/generate_keys', { password, cipher_mode: cipherMode })
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
