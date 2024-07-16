import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import './styles.css';

const FileUpload = () => {
  const [fileName, setFileName] = useState('');
  const [aesGenerated, setAesGenerated] = useState({
    key: '',
    iv: '',
    salt: '',
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5005';

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
      aesPassword: '',
      cipherMode: 'aes-256-cbc',
      aesKey: '',
      aesIV: '',
      aesSalt: '',
      encryptedChunkSize: '',
      destinationPath: '',
    },
    onSubmit: (values) => {
      console.log('Submitting form with values:', values);

      const formData = new FormData();
      for (let key in values) {
        if (key !== 'file') {
          formData.append(key, values[key]);
        }
      }
      formData.append('file', values.file);

      axios.post(`${backendUrl}/upload`, formData, {
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
    axios.get(`${backendUrl}/config`)
      .then(response => {
        console.log('Config data:', response.data);
        formik.setValues(response.data);
      })
      .catch(error => {
        console.error('Error fetching config:', error);
      });
  }, [backendUrl]);

  const generateAesKeys = (password, cipherMode) => {
    axios.post(`${backendUrl}/generate_keys`, { password, cipher_mode: cipherMode })
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
    <div className="App">
      <div className="title-box">
        <h1>C r y p t - T r a n s p o r t</h1>
      </div>
      <div className="readme-container">
        <div className="readme-box">
        <div className="readme-section">
          <h5>Backend Encryption Overview:</h5>
          <p>
            <strong>SSH Configuration:</strong> SSH is used exclusively for provisioning the remote machine for transport purposes. The actual data transport occurs over virtual network interfaces using mutual TLS (mTLS) as described below.
          </p>
          <p>
            <strong>mTLS Configuration:</strong> mTLS (mutual TLS) ensures mutual authentication between the client and server using certificates. This process guarantees that both parties are authenticated, establishing a secure communication channel protected from eavesdropping and tampering.
            <br /><br />
            The mTLS connection itself is secured using AES-256 encryption. This ensures that all data transmitted over the mTLS channel is protected, providing a high level of security and confidentiality.
            <br /><br />
            For every session, a new Certificate Authority (CA) is generated specifically for the mTLS connection. The server and client keys are valid only for the duration of a single transfer, ensuring that even if these keys are compromised, they cannot be reused for future sessions.
            <br /><br />
            Once mTLS authentication is complete, an AES-256 key exchange is performed to encrypt file chunks during transit. These AES encryption keys are also generated uniquely for each session and are valid only for the duration of the transfer, further enhancing security.
            <br /><br />
            For enhanced security, the data is double encrypted. First, the communication is secured via mTLS, which provides an encrypted channel using AES-256. Then, each file chunk is encrypted on the fly using the AES-256 algorithm configured below, adding another layer of encryption.
            <br /><br />
            The use of mTLS not only authenticates the entities involved but also establishes an encrypted channel that secures the AES-256 key exchange process. This ensures that the AES-256 keys used for encrypting file chunks are themselves protected by a secure channel, preventing any potential interception or tampering.
          </p>
          </div>
        </div>
        <form onSubmit={formik.handleSubmit} className='container my-4'>
        <div className="form-inner-wrapper">
          <div className="config-section">
            <h5>File to Transport</h5>
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
            </div>
          </div>

          <div className="config-section">
            <h5>SSH Configuration</h5>
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
          </div>

          <div className="config-section">
            <h5>mTLS Configuration</h5>
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
          </div>

          <div className="config-section">
            <h5>Encryption Configuration</h5>
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
          </div>

          <div className="config-section">
            <h5>Transport Configuration</h5>
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
        </div>
        </form>
      </div>
      
    </div>
    
  );
};

export default FileUpload;
