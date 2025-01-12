import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { db } from '../firebaseConfig';
import { components } from 'react-select';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth0 } from '@auth0/auth0-react';

const Create = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [Title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [collaboratorOptions, setCollaboratorOptions] = useState([]);

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

  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={props.data.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={`${props.data.label}'s profile`}
            style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
          />
          <span className='primary'>{props.data.label}</span>
        </div>
      </components.Option>
    );
  };

  const CustomMultiValue = (props) => {
    return (
      <components.MultiValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={props.data.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={`${props.data.label}'s profile`}
            style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
          />
          <span style={{ color: 'white' }}>{props.data.label}</span>
        </div>
      </components.MultiValue>
    );
  };

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
      backgroundColor: 'black',
      padding: '5px',
      borderRadius: '5px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: 'black',
        color: 'white',
      },
    }),
  };

  const loadCollaborators = async () => {
    if (collaboratorOptions.length === 0) {
      try {
        if (isAuthenticated && auth0User) {
          const userDocRef = doc(db, 'users', auth0User.sub);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const researchFellows = userData.following || [];

            const fellowPromises = researchFellows.map(async (fellowId) => {
              const fellowDocRef = doc(db, 'users', fellowId);
              const fellowDoc = await getDoc(fellowDocRef);
              if (fellowDoc.exists()) {
                const fellowData = fellowDoc.data();
                return {
                  value: fellowId,
                  label: fellowData.fullName || 'Unknown',
                  profilePicture: fellowData.profilePicture,
                };
              }
              return null;
            });

            const optionsArray = await Promise.all(fellowPromises);
            const options = optionsArray.filter((option) => option !== null);
            setCollaboratorOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching research fellows:", error);
        setError("Failed to load collaborators. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !auth0User) {
      setError('You must be logged in to create research');
      return;
    }

    if (!Title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth0User.sub);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Create new research object
        const newResearch = {
          id: Date.now().toString(),
          title: Title,
          description: description,
          topics: selectedTopics.map(topic => topic.label),
          collaborators: selectedCollaborators.map(collaborator => ({
            id: collaborator.value,
            name: collaborator.label,
            profilePicture: collaborator.profilePicture
          })),
          createdAt: new Date().toISOString(),
          createdBy: {
            id: auth0User.sub,
            name: userData.fullName,
            profilePicture: userData.profilePicture
          }
        };

        // Update user's research array
        await updateDoc(userDocRef, {
          research: arrayUnion(newResearch)
        });

        // Update collaborators' documents
        for (const collaborator of selectedCollaborators) {
          const collaboratorRef = doc(db, 'users', collaborator.value);
          await updateDoc(collaboratorRef, {
            collaborations: arrayUnion({
              ...newResearch,
              role: 'collaborator'
            })
          });
        }

        setSuccess('Research created successfully!');
        setError('');
        
        // Navigate to profile
        const username = userData.username || userData.displayName;
        setTimeout(() => {
          navigate(`/profile/${username}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving research:", error);
      setError('Failed to create research. Please try again.');
      setSuccess('');
    }
  };

  if (!isAuthenticated) {
    return <div className="primary text-center mt-5">Please log in to create a new project.</div>;
  }

  return (
    <div>
      <h1 className='primary' style={{ marginTop: '40px' }}>
        Create, Collaborate, Upload.
      </h1>
      <div className='row mt-5 justify-content-center align-items-center d-flex'>
        <div className='col-md-7 box'>
          <div className='row'>
            <h1 className='col-md-11 primary monarque mb-4' style={{ overflowWrap: 'break-word' }}>{Title}</h1>
            <p className='col-md-11 primary text-muted mb-4' style={{ overflowWrap: 'break-word' }}>{description}</p>
            {selectedTopics.length > 0 && (
              <div style={{marginBottom: '30px'}}>
                <svg style={{ marginRight: '10px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-tags-fill" viewBox="0 0 16 16">
                  <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                  <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                </svg>
                {selectedTopics.map((topic, index) => (
                  <span key={index} className="interest-pill">
                    {topic.label}
                  </span>
                ))}
              </div>
            )}
            <Form className="contact-form">
              <Form.Group className="mb-3" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '30px' }} controlId="formBasicFullName">
                <Form.Label className='primary'>Project Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  value={Title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength="120"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className='primary'>Project Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength="500"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'black' }}>Relevant Topics</Form.Label>
                <Select
                  isMulti
                  name="topics"
                  options={interestOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedTopics}
                  onChange={(selected) => {
                    if (selected.length <= 3) {
                      setSelectedTopics(selected);
                    }
                  }}
                  isOptionDisabled={() => selectedTopics.length >= 3}
                  placeholder="Select up to 3 topics"
                  styles={customStyles}
                />
              </Form.Group>
              {/* <Form.Group className="mb-3">
                <Form.Label style={{ color: 'black' }}>Collaborators</Form.Label>
                <Select
                  isMulti
                  name="collaborators"
                  options={collaboratorOptions}
                  className="basic-multi-select primary"
                  classNamePrefix="select"
                  value={selectedCollaborators}
                  onChange={(selected) => setSelectedCollaborators(selected)}
                  placeholder="Select collaborators"
                  styles={customStyles}
                  onMenuOpen={loadCollaborators}
                  components={{ Option: CustomOption, MultiValue: CustomMultiValue }}
                />
              </Form.Group> */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              <a
                className="custom-view" 
                style={{ marginBottom: '20px' }} 
                type="submit" 
                onClick={handleSubmit}
                // disabled={!Title.trim() || !description.trim()}
              >
                Create
              </a>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;