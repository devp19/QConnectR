// Import necessary packages
import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../App.css';

function QR() {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const userDocRef = doc(db, 'users', auth0User.sub);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setProfileData(userDocSnap.data());
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [isAuthenticated, auth0User]);

  if (loading) {
    return <div className="primary">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="primary">Please log in to view your QR code.</div>;
  }

  const profileUrl = `${window.location.origin}/profile/${profileData?.username || auth0User.nickname}`;

  return (
    <div className="row d-flex justify-content-center align-items-center" style={{ textAlign: 'center', padding: '20px' }}>
      <div className='col-md-7 box'>
        <h1 className='primary monarque'>Share Profile</h1>
        <div style={{ maxWidth: '300px', margin: '0 auto', padding: '50px 0' }}>
          <div className="qr-container" style={{ marginBottom: '20px' }}>
            <QRCode 
              value={profileUrl} 
              size={200}
              style={{ background: 'white', padding: '16px' }}
            />
          </div>
          
          <div className="profile-info" style={{ marginTop: '20px' }}>
            <h3 className="primary">{profileData?.fullName || auth0User.name}</h3>
            <p className="primary" style={{ wordBreak: 'break-all' }}>
              {profileUrl}
            </p>
          </div>

          <button
            className='custom-view mt-3'
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              alert('Profile URL copied to clipboard!');
            }}
          >
            Copy Profile URL
          </button>
        </div>
      </div>
    </div>
  );
}

export default QR;