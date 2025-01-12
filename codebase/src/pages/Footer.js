import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Footer = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUsername(userData.username);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUsername('');
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className='last-container'>
                <h1 className='primary'>⎉</h1>
                <p className='primary medium monarque' style={{marginLeft: '15px', marginTop: '12px'}}> QONNECTR</p>
            </div>
            
            <div>
                <div className='row d-flex justify-content-center' style={{lineHeight: '40px'}}>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/"><span className='primary'>Home</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/team"><span className='primary'>Team</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/search"><span className='primary'>Search</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/contact"><span className='primary'>Contact</span></Link>
                    </div>
                    
                </div>
            </div>
            <div className="center primary">
                <br></br>
                <br></br>
                ©2025, QONNECTR. All Rights Reserved.
            </div>
            <div className="center text-center reduce primary">
                By using this website, you accept our Terms of Use and Privacy Policy.
            </div>
        </div>
    );
};

export default Footer;