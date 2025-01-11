// src/components/ProfilePictureUpload.js
import React, { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ProfilePictureUpload = ({ user, updateProfilePicture, id, style }) => {
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    // Debug logs
    console.log('File selected:', file);
    console.log('User object:', user);

    if (!file || !user) {
      console.error('No file selected or no user object');
      setError('Please select a file and ensure you are logged in');
      return;
    }

    try {
      // Log file details
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Create unique file name
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-pictures/${user.sub}/profile-${Date.now()}.${fileExtension}`;
      console.log('Generated filename:', fileName);

      // Log S3 params
      const params = {
        Bucket: 'resdex-bucket',
        Key: fileName,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read' // Add this line to make the file publicly readable
      };
      console.log('S3 upload params:', params);

      // Upload to S3
      console.log('Starting S3 upload...');
      const uploadResult = await s3.upload(params).promise();
      console.log('S3 upload result:', uploadResult);

      const { Location } = uploadResult;
      console.log('File uploaded to:', Location);

      // Update Firestore
      console.log('Updating Firestore document for user:', user.sub);
      const userDocRef = doc(db, 'users', user.sub);
      await updateDoc(userDocRef, {
        profilePicture: Location
      });
      console.log('Firestore update successful');

      // Update UI
      updateProfilePicture(Location);
      console.log('Profile picture updated successfully');
      
      // Clear any previous errors
      setError(null);

    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });

      // Set specific error messages based on the error
      if (error.code === 'NoSuchBucket') {
        setError('S3 bucket not found. Please check your configuration.');
      } else if (error.code === 'AccessDenied') {
        setError('Access denied to S3. Please check your permissions.');
      } else if (error.name === 'FirebaseError') {
        setError('Error updating Firestore. Please try again.');
      } else {
        setError(`Error uploading profile picture: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        id={id}
        style={style}
        accept="image/*"
        onChange={handleFileChange}
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
    </div>
  );
};

export default ProfilePictureUpload;