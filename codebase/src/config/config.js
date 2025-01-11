const config = {
    apiUrl: process.env.NODE_ENV === 'production'
      ? 'https://qconnectr.onrender.com'
      : 'http://localhost:5000'
  };
  
  export default config;