import React from 'react';
import FileUpload from './FileUpload';
import './styles.css';

function App() {
  return (
    <div className="App">
      <div className="container">
        <h1 className="my-4">Crypt-Transport Secure Upload</h1>
        <FileUpload />
      </div>
    </div>
  );
}

export default App;
