import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth0 } from '@auth0/auth0-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { s3 } from '../awsConfig';
import Select from 'react-select';
import Carousel from 'react-bootstrap/Carousel';
import QRCode from 'react-qr-code'; // Import QRCode for generating QR codes


// Interest options for select
const interestOptions = [
  { value: 'Frontend', label: 'Frontend Development' },
  { value: 'Backend', label: 'Backend Development' },
  { value: 'Mobile', label: 'Mobile Development' },
  { value: 'DevOps', label: 'DevOps & Cloud' },
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'Machine-Learning', label: 'Machine Learning' },
  { value: 'Data-Science', label: 'Data Science' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'IoT', label: 'Internet of Things' },
  { value: 'AR-VR', label: 'AR/VR Development' },
  { value: 'Game-Dev', label: 'Game Development' },
  { value: 'UI-UX', label: 'UI/UX Design' },
  { value: 'Database', label: 'Database Systems' },
  { value: 'Network', label: 'Network Engineering' },
  { value: 'Embedded', label: 'Embedded Systems' },
  { value: 'Quantum', label: 'Quantum Computing' },
  { value: 'Robotics', label: 'Robotics' },
  { value: 'NLP', label: 'Natural Language Processing' },
  { value: 'Computer-Vision', label: 'Computer Vision' }
];

const Profile = () => {

  const { user: auth0User, isAuthenticated } = useAuth0();
  const { username } = useParams();
  const navigate = useNavigate(); // Hook to navigate between routes

  // Authentication and User States
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Data States
  const [profilePicture, setProfilePicture] = useState(null);
  const [about, setAbout] = useState('');
  const [organization, setOrganization] = useState('');
  const [interests, setInterests] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // PDF States
  const [pdfs, setPdfs] = useState([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [contributionsCount, setContributionsCount] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAbout, setNewAbout] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pdfToRemove, setPdfToRemove] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState([]);

  // UI States
  const [isHovering, setIsHovering] = useState(false);


  const fetchPDFs = useCallback(async (userId) => {
    if (!userId) {
      console.error('No userId provided to fetchPDFs');
      setPdfs([]);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('No user document found');
        setPdfs([]);
        return;
      }

      const userData = userDoc.data();
      if (!userData?.pdfs?.length) {
        setPdfs([]);
        return;
      }

      const validPdfs = [];
      for (const pdfData of userData.pdfs) {
        try {
          const response = await fetch(pdfData.url, { method: 'HEAD' });
          if (response.ok) {
            validPdfs.push(pdfData);
          }
        } catch (error) {
          console.error("PDF no longer exists:", error);
        }
      }

      setPdfs(validPdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfs([]);
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }
  
    try {
      const usernamesRef = collection(db, 'usernames');
      const q = query(usernamesRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        setProfileUser(null);
        setLoading(false);
        return;
      }
  
      const userDoc = querySnapshot.docs[0].data();
      const userId = userDoc.userId;
  
      if (!userId) {
        setLoading(false);
        return;
      }
  
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (!userDocSnapshot.exists()) {
        setLoading(false);
        return;
      }
  
      const userData = userDocSnapshot.data();
      const profileData = {
        ...userData,
        uid: userId
      };
  
      setProfileUser(profileData);
      setProfilePicture(userData.profilePicture || null);
      setAbout(userData.about || '');
      setOrganization(userData.organization || '');
      setInterests(userData.interests || '');
  
      if (userData.interests) {
        const interestsArray = userData.interests.split(', ');
        setSelectedInterests(
          interestsArray.map(interest => ({ value: interest, label: interest }))
        );
      }
  
      if (userId) {
        await fetchPDFs(userId);
      }
  
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username, fetchPDFs]);


  const updateProfilePicture = useCallback(async (newPictureUrl) => {
    if (!auth0User?.sub) return;
  
    try {
      const userDocRef = doc(db, 'users', auth0User.sub);
      await updateDoc(userDocRef, { profilePicture: newPictureUrl });
      setProfilePicture(newPictureUrl);
      await fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  }, [auth0User, fetchProfileData]);
  
  const updateAbout = useCallback(async (newAboutSection) => {
    if (!profileUser || !auth0User?.sub || auth0User.sub !== profileUser.uid) return;
  
    try {
      const userDocRef = doc(db, 'users', auth0User.sub);
      await updateDoc(userDocRef, { about: newAboutSection });
      await fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error("Error updating about section:", error);
    }
  }, [profileUser, auth0User, fetchProfileData]);
  
  const updateOrganization = useCallback(async (newOrganizationSection) => {
    if (!profileUser || !auth0User?.sub || auth0User.sub !== profileUser.uid) return;
  
    try {
      const userDocRef = doc(db, 'users', auth0User.sub);
      await updateDoc(userDocRef, { organization: newOrganizationSection });
      await fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error("Error updating organization section:", error);
    }
  }, [profileUser, auth0User, fetchProfileData]);
  
  const updateInterests = useCallback(async (newInterests) => {
    if (!profileUser || !auth0User?.sub || auth0User.sub !== profileUser.uid) return;
  
    try {
      const interestValues = newInterests.map(interest => interest.value);
      const userDocRef = doc(db, 'users', auth0User.sub);
      await updateDoc(userDocRef, { interests: interestValues.join(', ') });
      await fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error("Error updating interests:", error);
    }
  }, [profileUser, auth0User, fetchProfileData]);

  const handleEdit = (pdf) => {
    if (!auth0User?.sub || !profileUser || auth0User.sub !== profileUser.uid) {
      return;
    }
    setPdfToRemove(pdf);
    setEditedTitle(pdf.title);
    setEditedDescription(pdf.description);
    setEditedTags(pdf.topics ? pdf.topics.map(topic => ({ value: topic, label: topic })) : []);
    setShowRemoveModal(true);
  };

  const saveChanges = async () => {
    if (!pdfToRemove || !auth0User?.sub) return;
    try {
      const userDocRef = doc(db, 'users', auth0User.sub);
      const updatedPdfs = pdfs.map(pdf => 
        pdf.url === pdfToRemove.url 
          ? { 
              ...pdf, 
              title: editedTitle, 
              description: editedDescription,
              topics: editedTags.map(tag => tag.value)
            } 
          : pdf
      );
      await updateDoc(userDocRef, { pdfs: updatedPdfs });
      setPdfs(updatedPdfs);
    } catch (error) {
      console.error("Error updating PDF:", error);
      alert("Failed to update PDF. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setPdfToRemove(null);
    }
  };

  const confirmRemove = async () => {
    if (!pdfToRemove || !auth0User?.sub) return;

    try {
      const key = decodeURIComponent(pdfToRemove.url.split('resdex-bucket.s3.amazonaws.com/')[1]);
      const params = { Bucket: 'resdex-bucket', Key: key };
      await s3.deleteObject(params).promise();

      const userDocRef = doc(db, 'users', auth0User.sub);
      const updatedPdfs = pdfs.filter(pdf => pdf.url !== pdfToRemove.url);
      await updateDoc(userDocRef, { pdfs: updatedPdfs });

      setPdfs(updatedPdfs);
      if (currentPdfIndex >= updatedPdfs.length) {
        setCurrentPdfIndex(Math.max(0, updatedPdfs.length - 1));
      }
    } catch (error) {
      console.error("Error removing PDF:", error);
      alert("Failed to remove PDF. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setPdfToRemove(null);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);




  
  useEffect(() => {
    console.log('Profile User Data:', profileUser);
    console.log('Research Papers:', profileUser?.research);
    console.log('Collaborations:', profileUser?.collaborations);
  }, [profileUser]);








  useEffect(() => {
    if (profileUser?.uid) {
      fetchPDFs(profileUser.uid);
    }
  }, [profileUser, fetchPDFs]);

  useEffect(() => {
    if (profileUser) {
      setContributionsCount(profileUser.contributions || 0);
    }
  }, [profileUser]);

  const handleProfilePictureClick = () => {
    document.getElementById('profilePictureInput').click();
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleModalOpen = () => {
    setNewAbout(about);
    setNewOrganization(organization);
    const currentInterests = interests
      ? interests.split(', ').map(interest => ({ value: interest, label: interest }))
      : [];
    setSelectedInterests(currentInterests);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAboutSubmit = () => {
    if(newAbout !== about) {
      updateAbout(newAbout);
    }
    if(newOrganization !== organization) {
      updateOrganization(newOrganization);
    }
    const newInterestsString = selectedInterests.map(i => i.value).join(', ');
    if (newInterestsString !== interests) {
      updateInterests(selectedInterests);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return <p className='primary'>Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  const isOwnProfile = isAuthenticated && auth0User && auth0User.sub === profileUser?.uid;

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : 'black',
      backgroundColor: state.isSelected ? 'rgba(189,197,209,.3)' : 'white',
      '&:hover': {
        backgroundColor: 'rgba(189,197,209,.3)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#1a1a1a',
      padding: '10px',
      margin: '1px',
      borderRadius: '5px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: '#1a1a1a',
        color: 'white',
      },
    }),
  };


  const qrData = "https://example.com";

  // Function to download QR Code as an SVG
  const handleDownloadQRCode = () => {
    const svgElement = document.getElementById('qr-code');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGoToQRPage = () => {
    navigate('/QR'); // Navigate to the QR code generator page
  };








  return (
    <div>
      <div className='row d-flex justify-content-center mt-3 fade-in' 
           style={{marginBottom: '20px'}}>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-9 box' style={{padding: '20px'}}>
            {/* Edit Profile Button */}
            <div className='row d-flex justify-content-center'>
              <div className='col'>
                <div className='col-md' style={{position:'relative', textAlign: 'right'}}>                    
                  {isOwnProfile && (
                    <button className='custom-edit' onClick={handleModalOpen}> 
                      <svg style={{marginRight: '14px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="bi bi-pencil-square" fill="white" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="row d-flex justify-content-center" style={{ marginTop: "1px" }}>
            <div className="col">
              <div className="col-md" style={{ position: "relative", textAlign: "right", marginTop: "20px" }}>
                {isOwnProfile && (
                  <button className="custom-edit" onClick={handleGoToQRPage}>
                    <svg
                      style={{ marginRight: "14px" }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      className="bi bi-qr-code-scan"
                      fill="white"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 2h2v2H2V2ZM1 1v4h4V1H1Zm2 10h2v2H2v-2Zm-1 1v4h4v-4H1Zm10-9h2v2h-2V3Zm-1 0v4h4V1h-4v2Zm0 10h2v2h-2v-2Zm-1 0v4h4v-4h-4Zm0-5v1h1v1h-1v2h-1V7h2v1h-1ZM2 7h2v1H2V7Zm0 4h1v1H1v-1h1v-1h1v1Zm4-5v2H4v1h2V8h1v1h2V7H6Zm2 4h1v1H7v-2h2v1H7v1Z" />
                    </svg>
                    QR Code Generator
                  </button>
                )}
              </div>
            </div>
          </div>


            {/* QR Code (hidden until downloaded) */}
            <div style={{ display: 'none' }}>
              <QRCode id="qr-code" value={qrData} size={150} />
            </div>
<div className='row d-flex justify-content-center'>
            {/* Profile Picture Section */}
            <div
  style={{
    display: 'flex',
    justifyContent: 'center', // Horizontally centers the content
    alignItems: 'center', // Vertically centers the content
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ccc',
    cursor: isOwnProfile ? 'pointer' : 'default',
  }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onClick={isOwnProfile ? handleProfilePictureClick : undefined}
>
  {profilePicture ? (
    <img
      src={profilePicture}
      alt="Profile"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Ensures the image covers the whole area without distortion
        display: 'block', // Removes any space below the image
      }}
    />
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888',
      }}
    >
      No Image
    </div>
  )}
  {isOwnProfile && isHovering && (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      Change Picture
    </div>
  )}
</div>
</div>


            {/* Profile Information */}
            <div className='row'>
              <div className='col-md text-center'>
                <h1 className='primary mt-4'>
                  {profileUser.fullName}
                  {(username === "dev" || username === "fenil" || username === "dev" || username === "sapna" || username === "aryan") && (
                    <svg style={{ marginLeft: '20px' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-patch-check-fill" viewBox="0 0 16 16" title="Verified user">
                      <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
                    </svg>
                  )}
                </h1>
              </div>
            </div>

            {/* About Section */}
            <p className='text-center' style={{color: 'grey'}}>{about}</p>

            {/* Organization and Interests */}
            <div className='row d-flex justify-content-center' style={{margin: '0px'}}>
              <div className='col-md-5 box' style={{
                textAlign: 'left', 
                borderLeft: '1px solid white', 
                marginTop: '10px', 
                marginBottom: '20px', 
                padding: '20px', 
                margin: '5px'
              }}>
                {organization && (
                  <p className='primary text-center'>
                    <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-buildings" viewBox="0 0 16 16">
                      <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
                      <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
                    </svg>
                    {organization}
                  </p>
                )}

                {interests && interests.length > 0 && (
                  <div className='text-center'>
                    <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-tags-fill" viewBox="0 0 16 16">
                      <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                      <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                    </svg>
                    {interests.split(', ').map((interest, index) => (
                      <span key={index} className="interest-pill">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          

          </div>

          
        </div>

        <div className='mt-5'>
  <div style={{borderRadius: '5px'}} className='row d-flex justify-content-center'>
    <div className='col-md-9 box'>
      <div className='row d-flex' style={{marginTop: "-10px"}}>
        <div className='col-md align-items-center' style={{padding: 'none'}}>
          
          <div className='row primary p-2'>
            <h4 className='col-md primary'>
              Shared Projects      

          </h4>
          <a className='col-md-3 text-center custom-view justify-content-end' target='_blank' href='https://qonnectr.vercel.app/create'>Add Project</a>

</div>
          </div>
                
      </div>

      <div style={{
        borderRadius: '5px',
        padding: '20px',
        paddingBottom: '50px',
        marginBottom: '10px',
      }} className='row justify-content-center align-items-center'>
        {profileUser.research && profileUser.research.length > 0 ? (
          // Sort papers by date and map through them
          [...profileUser.research]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((paper, index) => (
              <div key={index} style={{
                marginBottom: index !== profileUser.research.length - 1 ? '30px' : '0',
                borderBottom: index !== profileUser.research.length - 1 ? '1px solid white' : 'none',
                paddingBottom: '30px'
              }}>
                <div className='d-flex justify-content-center'>
                  <div className='row mt-3' style={{ width: '100%' }}>
                    <div className="text-white mt-3" style={{borderLeft: '1px solid white', paddingLeft: '30px'}}>
                      <h5 className='primary'>{paper.title}</h5>
                      <p className='primary'>{paper.description}</p>

                      {/* Topics */}
                      {paper.topics && paper.topics.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-tags-fill" viewBox="0 0 16 16">
                            <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                            <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                          </svg>
                          {paper.topics.map((topic, idx) => (
                            <span key={idx} className="interest-pill-white">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

{paper.projectLink && (
  <div style={{ marginTop: '10px' }}>
    <a href={paper.projectLink} target="_blank" rel="noopener noreferrer" className="primary">
{paper.projectLink}    </a>
  </div>
)}

                    

                      {/* Created Date */}
                      <small className='primary' style={{ opacity: 0.7 }}>
                        Created: {new Date(paper.createdAt).toLocaleDateString()}
                      </small>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
  
  
  {isOwnProfile && (
    <div 
      onClick={() => {
        if (window.confirm('Are you sure you want to delete this project?')) {
          // Add delete functionality here
          const updatedResearch = profileUser.research.filter(p => p.id !== paper.id);
          const userDocRef = doc(db, 'users', auth0User.sub);
          updateDoc(userDocRef, {
            research: updatedResearch
          }).then(() => {
            // Update local state
            setProfileUser(prev => ({
              ...prev,
              research: updatedResearch
            }));
          }).catch(error => {
            console.error("Error deleting research:", error);
          });
        }
      }}
      style={{ 
        cursor: 'pointer', 
        opacity: 0.5,
        transition: 'opacity 0.2s',
        padding: '5px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="white" 
        className="bi bi-trash" 
        viewBox="0 0 16 16"
      >
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
      </svg>
    </div>
  )}
</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center primary" style={{marginTop: '40px'}}>
            <a className='primary' target='_blank' href='https://qonnectr.vercel.app/create'>⨁ Add Project</a>
            {/* <a className='primary' target='_blank' href='http://localhost:3000/create'>⨁ Add Project</a> */}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
        
      </div>

      


      {/* Profile Picture Upload */}
      {isOwnProfile && (
        <ProfilePictureUpload
          user={auth0User}
          updateProfilePicture={updateProfilePicture}
          id="profilePictureInput"
          style={{ display: 'none' }}
        />
      )}







            {/* Edit Profile Modal */}
            <Modal show={isModalOpen} onHide={handleModalClose} className='box'>
  <Modal.Header style={{background: 'black', borderBottom: '1px solid white'}} closeButton>
    <Modal.Title className='white'>Edit Profile</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{background: 'black', borderBottom: '1px solid white', color: 'white'}}>
    {/* About Section */}
    <div style={{borderBottom: '1px solid white', paddingBottom: '20px'}}>
      <p><strong className='primary'>About</strong></p>
      <textarea
        spellCheck="false"
        maxLength="300"
        value={newAbout}
        onChange={(e) => setNewAbout(e.target.value)}
        rows="6"
        style={{ 
          width: '100%', 
          color: 'white', 
          backgroundColor: 'black',
          borderRadius: '5px', 
          resize: "none", 
          padding: '20px',
          border: '1px solid white' 
        }}
      />
    </div>
    <br />

    {/* Organization Section */}
    <div style={{borderBottom: '1px solid white', paddingBottom: '20px'}}>
      <p><strong className='primary'>Organization</strong></p>
      <textarea
        spellCheck="false"
        maxLength="40"
        value={newOrganization}
        onChange={(e) => setNewOrganization(e.target.value)}
        rows="1"
        style={{ 
          width: '100%', 
          color: 'white', 
          backgroundColor: 'black',
          borderRadius: '5px', 
          resize: "none", 
          padding: '20px',
          border: '1px solid white' 
        }}
      />
    </div>
    <br />

    {/* Interests Section */}
    <p><strong className='primary'>Interests</strong></p>
    <Select
      isMulti
      name="interests"
      options={interestOptions}
      className="basic-multi-select"
      classNamePrefix="select"
      value={selectedInterests}
      rows='1'
      onChange={(selected) => {
        if (selected.length <= 3) {
          setSelectedInterests(selected);
        }
      }}
      isOptionDisabled={() => selectedInterests.length >= 3}
      placeholder="Select up to 3 interests"
      styles={{
        ...customStyles,
        control: (provided) => ({
          ...provided,
          backgroundColor: 'black',
          color: 'white',
          border: '1px solid white',
        }),
        option: (provided) => ({
          ...provided,
          backgroundColor: 'black',
          color: 'white',
        }),
      }}
    />
    <br />
  </Modal.Body>
  <Modal.Footer style={{background: 'black', borderTop: '1px solid white'}}>
    <a className='custom-view' onClick={handleModalClose} style={{color: 'black'}}>
      Cancel
    </a>
    <a className='custom-view' onClick={handleAboutSubmit} style={{color: 'black'}}>
      Save
    </a>
  </Modal.Footer>
</Modal>


      

    </div>



  );
};




export default Profile;