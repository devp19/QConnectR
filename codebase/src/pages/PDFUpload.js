// src/components/PDFUpload.js
import React, { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const PDFUpload = ({ user, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    
    // Debug logs
    console.log('Upload attempted with:', {
      file: file,
      user: user,
      userId: user?.sub
    });

    // Validation checks
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!user?.sub) {
      setError('User not authenticated');
      console.error('No user ID available:', user);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.includes('pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (e.g., 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Create unique filename
      const fileName = `pdfs/${user.sub}/${Date.now()}-${file.name}`;

      // Upload to S3
      const params = {
        Bucket: 'resdex-bucket',
        Key: fileName,
        Body: file,
        ContentType: file.type
      };

      console.log('Uploading to S3 with params:', params);

      const { Location } = await s3.upload(params).promise();
      console.log('S3 upload successful:', Location);

      // Get existing user document
      const userDocRef = doc(db, 'users', user.sub);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User document not found in Firestore');
      }

      // Prepare PDF metadata
      const pdfData = {
        url: Location,
        title: file.name.replace('.pdf', ''),
        description: '',
        uploadDate: new Date().toISOString(),
        topics: []
      };

      // Update Firestore
      await updateDoc(userDocRef, {
        pdfs: arrayUnion(pdfData)
      });

      console.log('Firestore update successful');

      // Clear input
      event.target.value = '';

      // Callback
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button className='custom' onClick={() => document.getElementById('pdfInput').click()}>
        {uploading ? 'Uploading...' : 'Upload Research'}
      </button>
      <input
        id="pdfInput"
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      {error && (
        <div style={{
          color: 'red',
          marginTop: '10px',
          fontSize: '14px',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
      {uploading && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          Uploading PDF...
        </div>
      )}
    </div>
  );
};

export default PDFUpload;