import React, { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ProfilePictureUpload = ({ user, updateProfilePicture, id, style }) => {
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file || !user) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.sub);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const lastUpdated = userDoc.data().lastProfilePictureUpdate;

        if (lastUpdated) {
          const lastUpdatedDate = new Date(lastUpdated.seconds * 1000); 
          const currentDate = new Date();
          
          if (
            lastUpdatedDate.toDateString() === currentDate.toDateString()
          ) {
            setError(
              'You can only update your profile picture once per day. Please try again tomorrow.'
            );
            return;
          }
        }
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-pictures/${user.sub}/profile-${Date.now()}.${fileExtension}`;

      const params = {
        Bucket: 'resdex-bucket',
        Key: fileName,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read',
      };

      const uploadResult = await s3.upload(params).promise();
      const { Location } = uploadResult;

      await updateDoc(userDocRef, {
        profilePicture: Location,
        lastProfilePictureUpdate: new Date(),
      });

      updateProfilePicture(Location);
      setError(null);

    } catch (error) {
      console.error('Error:', error);
      setError(`Error uploading profile picture: ${error.message}`);
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
        <div
          style={{
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
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
