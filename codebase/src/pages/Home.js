import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../images/dark-transparent.png';
import MLH from '../images/mlh-logo-white.png'
import DELTA from '../images/original.png';
import AUTH0 from '../images/auth0-logo-white.png';
import FIREBASE from '../images/logo-firebase.webp';
import Dev from '../images/dev.png';
import Empty from '../images/empty.webp';
import Alert from 'react-bootstrap/Alert';


const Home = () => {

  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller");

    function addAnimation() {
      scrollers.forEach((scroller) => {
        if (scroller.getAttribute("data-animated")) return;

        scroller.setAttribute("data-animated", true);

        const scrollerInner = scroller.querySelector(".scroller__inner");
        const scrollerContent = Array.from(scrollerInner.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          duplicatedItem.setAttribute("aria-hidden", true);
          scrollerInner.appendChild(duplicatedItem);
        });
      });

      // Trigger fade-in effect
      document.querySelectorAll('.fade-in').forEach(element => {
        element.classList.add('visible');
      });
    }

    addAnimation();
  }, []); // Empty dependency array ensures this only runs once on mount

  return (
    <div>
       

      <div className='center-container fade-in'>

        <div>
          <div className='row justify-content-center d-flex display fade-in'>
            {/* <img src={Logo} style={{ maxWidth: '70px', fill: 'black' }} alt='resdex-logo'></img> */}
            <h1 className='primary akros text-center'>⎉</h1>
          </div>
          <div className='row text-center fade-in'>
            <p className='primary'>⏐</p>
          </div>
          <div className='row text-center fade-in'>
            <p className='akros primary title'>QonnectR</p>
            {/* <p className='akros title primary' style={{ marginTop: '-40px' }}><span className='primary title monarque'>–made </span>easy</p> */}
          </div>

          {/* <div className='center pt-4 fade-in'>
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="primary">
              <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/>
            </svg>
          </div> */}
          <div className='center pt-4 fade-in'>
            <p className='monarque primary secondary'>" Where Projects Find People "</p>
          </div>

          <div className='row d-flex justify-content-center minus'>
        <div className='col-md-6 box'>
        <p className='primary small text-center'>Showcase projects, invite collaborators, and join like-minded individuals to transform ideas.</p>
        </div>
        <br></br>
        <h1 className='primary title-2 text-center'>⌄</h1>
        </div>
        </div>
      </div>


      <div className='container fade-in'>
        <div className='horizontal-line'></div>
        <div className='row justify-content-center top'>
        <div className='col-md-4 box mx-3 mb-3'>
              <div className='column-content'>
                <h3 className='monarque primary'> NETWORKING </h3>
                <p className='primary mt-4'>"Share, discover, and grow—all in one seamless platform designed to empower your networking, collaboration, and professional connections."</p>
              </div>
            </div>
            <div className='col-md-4 box mx-3 mb-3'>
              <div className='column-content primary'>
              <h3 className='monarque primary'> EASE OF ACCESS </h3>
                <p className='primary mt-4'>"Effortlessly share with concise briefings and seamless Apple Wallet integration, making connections simpler than ever."</p>
              </div>
            </div>
                </div>
      </div>

      <div className='container fade-in top'>
        {/* <p className='primary center top monarque' style={{ fontSize: '25px', marginBottom: '30px' }}>A student led initiative from</p> */}
        <div className='row d-flex justify-content-center fade-in'>
        <div class="scroller box " data-direction="right" data-speed="slow">
            <div class="scroller__inner mb-4">
              <img style={{height: '60px', marginRight: '30px', marginLeft: '30px'}} src={MLH} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={DELTA} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={AUTH0} alt="" />
              <img style={{height: '60px',  marginRight: '50px', marginLeft: '30px'}} src={FIREBASE} alt="" />
            </div>
      </div>        
      </div>
      </div>

    


      <div className='center-sample fade-in pt-4'>
        <div className='row'>
          <div className='col-md-8 mx-auto title-2 primary fade-in'>
          <h1 className='primary title-2 text-center'>⌄</h1>
          <br></br>
          Building a <span className='monarque primary'><strong>–</strong>community</span>  one step <br></br>at a time!
          <br></br>
            <div className='smaller-text' style={{marginTop: '60px'}}>
              <a className='custom-view' to='/signup'>Sign Up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
