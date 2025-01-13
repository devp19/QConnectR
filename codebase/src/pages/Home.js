import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MLH from '../images/mlh-logo-white.png'
import DELTA from '../images/original.png';
import AUTH0 from '../images/auth0-logo-white.png';
import FIREBASE from '../images/logo-firebase.webp';
import VERCEL from '../images/vercel-text.svg';
import AWS from '../images/aws-brand.svg';


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
            <h1 className='primary akros text-center'>⎉</h1>
          </div>
          <div className='row text-center fade-in'>
            <p className='primary'>⏐</p>
          </div>
          <div className='row text-center fade-in'>
            <p className='akros primary title'>QonnectR</p>
          </div>

         
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
        <div className='row d-flex justify-content-center fade-in'>
        <div class="scroller box " data-direction="right" data-speed="slow">
            <div class="scroller__inner mb-4">
              <img style={{height: '60px', marginRight: '30px', marginLeft: '30px'}} src={MLH} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={DELTA} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={AUTH0} alt="" />
              <img style={{height: '60px',  marginRight: '50px', marginLeft: '30px'}} src={FIREBASE} alt="" />
              <img style={{height: '60px',  marginRight: '50px', marginLeft: '30px'}} src={VERCEL} alt="" />
              <img style={{height: '60px',  marginRight: '50px', marginLeft: '30px'}} src={AWS} alt="" />
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
              <a className='custom-view' href='https://qonnectr.vercel.app/signup'>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
