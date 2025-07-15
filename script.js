// Array of high-definition images for dynamic banner
    const images = [
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920', // Beach
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920', // Forest
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920', // Mountain
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'  // Cityscape
    ];

    // Function to change background image dynamically
    function changeBackground() {
      const banner = document.querySelector('.banner');
      let currentIndex = 0;

      // Use setInterval for continuous background changes
      setInterval(() => {
        banner.style.backgroundImage = `url(${images[currentIndex]})`;
        banner.style.backgroundSize = 'cover'; // Ensure proper size
        banner.style.backgroundPosition = 'center'; // Center the image
        currentIndex = (currentIndex + 1) % images.length;
      }, 5000); // Change background every 5 seconds
    }

    window.onload = changeBackground;

    let currentUser = null;

    function openModal(type) {
      const modal = document.getElementById(type + '-modal');
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('open');
      }, 10);
    }

    function closeModal(type) {
      const modal = document.getElementById(type + '-modal');
      modal.classList.remove('open');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 500);
    }

    function toggleLoginOption() {
      const usernameLogin = document.getElementById('login-username');
      const mobileLogin = document.getElementById('login-mobile');
      if (usernameLogin.style.display === 'none') {
        usernameLogin.style.display = 'block';
        mobileLogin.style.display = 'none';
      } else {
        usernameLogin.style.display = 'none';
        mobileLogin.style.display = 'block';
      }
    }

    function isE164(number) {
      return /^\+\d{10,15}$/.test(number);
    }

    function generateOtpSignUp() {
      const mobile = document.getElementById('signup-mobile').value;
      if (!mobile) {
        alert("Please enter your mobile number first.");
        return;
      }
      if (!isE164(mobile)) {
        alert("Please enter your mobile number in E.164 format (e.g. +91932778XXXX).");
        return;
      }
      fetch('http://localhost:5000/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })
      .then(response => response.json())
      .then(result => {
        alert(result.message);
      })
      .catch(error => {
        console.error('Error generating OTP:', error);
        alert("Failed to generate OTP.");
      });
    }

    function generateOtpLogin() {
      const mobile = document.getElementById('login-mobile-field').value;
      if (!mobile) {
        alert("Please enter your mobile number first.");
        return;
      }
      if (!isE164(mobile)) {
        alert("Please enter your mobile number in E.164 format (e.g. +91932778XXXX).");
        return;
      }
      fetch('http://localhost:5000/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })
      .then(response => response.json())
      .then(result => {
        alert(result.message);
      })
      .catch(error => {
        console.error('Error generating OTP:', error);
        alert("Failed to generate OTP.");
      });
    }

    // Token management functions
    function storeAuthToken(token, user) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function getAuthToken() {
      return localStorage.getItem('authToken');
    }

    function isLoggedIn() {
      return !!getAuthToken();
    }

    function logoutUser() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      currentUser = null;
      // Update UI to show logged out state
      document.querySelector(".auth-buttons").innerHTML = `
        <button onclick="openModal('signup')">Sign Up</button>
        <button onclick="openModal('login')">Log In</button>
      `;
    }

    function handleSignUp(e) {
      e.preventDefault();
      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const mobile = document.getElementById('signup-mobile').value;
      const otp = document.getElementById('signup-otp').value;
      const data = { username, email, password, mobile, otp };
      fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.token && result.user) {
          // Store the token and user info
          storeAuthToken(result.token, result.user);
          currentUser = result.user.username;
          document.querySelector(".auth-buttons").innerHTML = `
            <span>Hello, ${currentUser}</span>
            <button onclick="logoutUser()">Logout</button>
          `;
        }
        alert(result.message);
        closeModal('signup');
      })
      .catch(error => {
        console.error('Error during sign up:', error);
        alert('Sign up failed');
      });
      return false;
    }

    function handleLoginUsername(e) {
      e.preventDefault();
      const username = document.getElementById('login-username-field').value;
      const password = document.getElementById('login-password').value;
      const data = { username, password };
      fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.token && result.user) {
          // Store the token and user info
          storeAuthToken(result.token, result.user);
          currentUser = result.user.username;
          document.querySelector(".auth-buttons").innerHTML = `
            <span>Hello, ${currentUser}</span>
            <button onclick="logoutUser()">Logout</button>
          `;
        }
        alert(result.message);
        closeModal('login');
      })
      .catch(error => {
        console.error('Error during login:', error);
        alert('Login failed');
      });
      return false;
    }

    function handleLoginMobile(e) {
      e.preventDefault();
      const mobile = document.getElementById('login-mobile-field').value;
      const otp = document.getElementById('login-mobile-otp').value;
      const data = { mobile, otp };
      fetch('http://localhost:5000/api/login-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.token && result.user) {
          // Store the token and user info
          storeAuthToken(result.token, result.user);
          currentUser = result.user.username;
          document.querySelector(".auth-buttons").innerHTML = `
            <span>Hello, ${currentUser}</span>
            <button onclick="logoutUser()">Logout</button>
          `;
        }
        alert(result.message);
        closeModal('login');
      })
      .catch(error => {
        console.error('Error during mobile login:', error);
        alert('Login failed');
      });
      return false;
    }

    function handleSearch(e) {
      e.preventDefault();
      if (!isLoggedIn()) {
        alert("Please sign up or log in to search.");
        return false;
      }
      alert("Search functionality is not implemented in this clone.");
      return false;
    }

    // Enhanced Seamless Infinite Scrolling Implementation
    document.addEventListener('DOMContentLoaded', function() {
      // Clone the first set of cards into the second container for seamless scrolling
      const container1 = document.getElementById('card-container-1');
      const container2 = document.getElementById('card-container-2');
      container2.innerHTML = container1.innerHTML;
      
      // Calculate animation duration based on number of cards and their width
      const cards = container1.querySelectorAll('.card');
      const cardCount = cards.length;
      const cardWidth = cards[0].offsetWidth;
      const gapWidth = 30; // This should match the CSS gap value
      const totalScrollWidth = cardCount * (cardWidth + gapWidth);
      
      // Set up the animation
      const scrollDuration = totalScrollWidth * 40; // Speed factor - higher number = slower
      
      // Apply animation to both containers
      const infiniteScroll = document.querySelector('.infinite-scroll-container');
      
      // Variable to track animation progress
      let scrollProgress = 0;
      let animationId;
      let isPaused = false;
      
      // Progress bar
      const progressBar = document.getElementById('scroll-progress-bar');
      
      function updateScroll() {
        if (isPaused) return;
        
        // Increment progress
        scrollProgress += 0.5;
        
        // Reset when we've scrolled through the first container
        if (scrollProgress >= totalScrollWidth) {
          scrollProgress = 0;
        }
        
        // Update scroll position
        infiniteScroll.style.transform = `translateX(${-scrollProgress}px)`;
        
        // Update progress bar (cycles from 0% to 100%)
        const progressPercentage = (scrollProgress / totalScrollWidth) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Continue animation loop
        animationId = requestAnimationFrame(updateScroll);
      }
      
      // Start animation
      animationId = requestAnimationFrame(updateScroll);
      
      // Pause animation on hover
      infiniteScroll.addEventListener('mouseenter', function() {
        isPaused = true;
      });
      
      infiniteScroll.addEventListener('mouseleave', function() {
        isPaused = false;
        animationId = requestAnimationFrame(updateScroll);
      });
      
      // Optimize performance by pausing animation when not in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isPaused = false;
            if (!animationId) {
              animationId = requestAnimationFrame(updateScroll);
            }
          } else {
            isPaused = true;
            if (animationId) {
              cancelAnimationFrame(animationId);
              animationId = null;
            }
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(document.querySelector('.destinations'));

      // Add scroll event handler for sticky header
      window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });

      // Add intersection observer for revealing animations
      const revealElements = document.querySelectorAll('.destinations, .banner-content');
      
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      revealElements.forEach(el => {
        revealObserver.observe(el);
      });

      // Check if user is already logged in
      if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.username) {
          currentUser = user.username;
          document.querySelector(".auth-buttons").innerHTML = `
            <span>Hello, ${currentUser}</span>
            <button onclick="logoutUser()">Logout</button>
          `;
        }
      }
    });