// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for navigation links
  const navLinks =
      document.querySelectorAll('nav a, .footer-links a, .hero-content a');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only apply to links that start with #
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,  // Offset for fixed header
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Add active class to navigation links based on scroll position
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('nav ul li a');

  window.addEventListener('scroll', function() {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // Fetch real App Store data for all app cards
  initAppCards();

  // Animation on scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll(
        '.product-card, .step, .stat-item, .contact-method');

    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add('animate');
      }
    });
  };

  // Run animation check on scroll
  window.addEventListener('scroll', animateOnScroll);

  // Run once on page load
  animateOnScroll();

  // Mobile navigation toggle (for future implementation)
  // This is a placeholder for when you want to add a mobile menu button
  const mobileNavToggle = document.createElement('div');
  mobileNavToggle.className = 'mobile-nav-toggle';
  mobileNavToggle.innerHTML = '<span></span><span></span><span></span>';

  document.querySelector('header .container').appendChild(mobileNavToggle);

  mobileNavToggle.addEventListener('click', function() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('show');
    this.classList.toggle('active');
  });
});

/**
 * Initialize all app cards with their respective App Store data
 */
function initAppCards() {
  // Find all product cards with data-app-id attribute
  const productCards = document.querySelectorAll('.product-card[data-app-id]');
  
  // If product cards with data-app-id don't exist yet, use the hardcoded ID for backward compatibility
  if (productCards.length === 0) {
    fetchAppStoreData('6741676611');
    return;
  }
  
  // Process each product card
  productCards.forEach(card => {
    const appId = card.getAttribute('data-app-id');
    if (appId) {
      fetchAppStoreData(appId, card);
    }
  });
}

/**
 * Fetches real app data from the App Store
 * @param {string} appId - The Apple App Store ID
 * @param {Element} [container] - Optional container element for this app card
 */
function fetchAppStoreData(appId, container = null) {
  const lookupUrl = `https://itunes.apple.com/lookup?id=${appId}`;
  
  // Try the direct fetch first
  fetch(lookupUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.results && data.results.length > 0) {
        // Get the app data directly since we're using the exact ID
        const app = data.results[0];
        updateAppStats(app, container);
      } else {
        console.log('App data not found for the provided ID');
        // If no results, fall back to JSONP
        fetchAppDataWithJSONP(appId, container);
      }
    })
    .catch(error => {
      console.error('Error fetching App Store data:', error);
      // If fetch fails (likely due to CORS), try JSONP as fallback
      fetchAppDataWithJSONP(appId, container);
    });
}

/**
 * Fallback method to fetch app data using JSONP approach which avoids CORS issues
 * @param {string} appId - The Apple App Store ID
 * @param {Element} [container] - Optional container element for this app card
 */
function fetchAppDataWithJSONP(appId, container = null) {
  const callbackName = 'appStoreCallback_' + appId;
  
  // Create a global callback function
  window[callbackName] = function(data) {
    if (data.results && data.results.length > 0) {
      updateAppStats(data.results[0], container);
    } else {
      // If JSONP also fails, try a third fallback approach
      fetchWithCorsProxy(appId, container);
    }
    // Clean up - remove script and global callback
    document.body.removeChild(script);
    delete window[callbackName];
  };
  
  // Create a script element to fetch data
  const script = document.createElement('script');
  script.src = `https://itunes.apple.com/lookup?id=${appId}&callback=${callbackName}`;
  document.body.appendChild(script);
  
  // Set a timeout to handle cases where the API doesn't respond
  setTimeout(() => {
    if (window[callbackName]) {
      console.log('iTunes API JSONP request timed out');
      document.body.removeChild(script);
      delete window[callbackName];
      // Try the proxy fallback
      fetchWithCorsProxy(appId, container);
    }
  }, 5000);
}

/**
 * Last resort fallback using a CORS proxy
 * Use this only if direct fetch and JSONP both fail
 * @param {string} appId - The Apple App Store ID
 * @param {Element} [container] - Optional container element for this app card
 */
function fetchWithCorsProxy(appId, container = null) {
  // Use a public CORS proxy (for demo purposes - consider using your own for production)
  const corsProxyUrl = 'https://corsproxy.io/?';
  const targetUrl = encodeURIComponent(`https://itunes.apple.com/lookup?id=${appId}`);
  
  fetch(`${corsProxyUrl}${targetUrl}`)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        updateAppStats(data.results[0], container);
      } else {
        console.log('Final fallback failed - hiding stats');
        // If all methods fail, hide the stats
        hideAppStats(container);
      }
    })
    .catch(error => {
      console.error('Error with CORS proxy approach:', error);
      // All methods failed, hide the stats
      hideAppStats(container);
    });
}

/**
 * Hides app statistics when fetching fails
 * @param {Element} [container] - Optional container element for this app card
 */
function hideAppStats(container = null) {
  const productStats = container ? 
    container.querySelector('.product-stats') : 
    document.querySelector('.product-stats');
  
  if (!productStats) return;
  
  // Select the spans directly since we no longer have Font Awesome classes
  const spans = productStats.querySelectorAll('span');
  if (spans.length >= 2) {
    // First span is for reviews (previously downloads)
    spans[0].innerHTML = '💬';
    // Second span is for rating
    spans[1].innerHTML = '';
  }
}

/**
 * Updates the app statistics in the UI with real data
 * @param {Object} appData - The app data from iTunes API
 * @param {Element} [container] - Optional container element for this app card
 */
function updateAppStats(appData, container = null) {
  const productStats = container ? 
    container.querySelector('.product-stats') : 
    document.querySelector('.product-stats');
  
  if (!productStats) return;
  
  // Select the spans directly since we no longer have Font Awesome classes
  const spans = productStats.querySelectorAll('span');
  if (spans.length < 2) {
    console.error('Product stats elements not found');
    return;
  }
  
  const reviewSpan = spans[0];
  const ratingSpan = spans[1];
  
  // Check if we have valid app data
  if (!appData || typeof appData !== 'object') {
    console.error('Invalid app data received');
    hideAppStats(container);
    return;
  }
  
  // Format review count since iTunes doesn't provide downloads
  const userRatingCount = appData.userRatingCount || 0;
  let reviewText = '';
  
  if (userRatingCount > 1000000) {
    reviewText = Math.floor(userRatingCount / 1000000) + 'M+ Reviews';
  } else if (userRatingCount > 1000) {
    reviewText = Math.floor(userRatingCount / 1000) + 'K+ Reviews';
  } else if (userRatingCount > 0) {
    reviewText = userRatingCount + '+ Reviews';
  }
  
  // Format rating with proper handling of missing data - using 5-star visual representation
  const averageRating = appData.averageUserRating || 0;
  let ratingText = '';
  
  if (averageRating > 0) {
    // Generate 5-star visual rating using filled and empty stars
    ratingText = generateStarRating(averageRating);
  }
  
  // Update the UI with Unicode symbols
  reviewSpan.innerHTML = `💬 ${reviewText}`;
  ratingSpan.innerHTML = ratingText;
  
  // If we have app info, update any other relevant elements
  if (appData.trackName) {
    // Optional: Update app name if it's different
    const appNameElement = container ? 
      container.querySelector('.product-info h3') : 
      document.querySelector('.product-info h3');
      
    if (appNameElement && !appNameElement.getAttribute('data-original')) {
      // Save original text
      appNameElement.setAttribute('data-original', appNameElement.textContent);
      // Update only if the returned name contains a match to the original name
      const originalName = appNameElement.textContent;
      if (appData.trackName.includes(originalName) || originalName.includes(appData.trackName)) {
        appNameElement.textContent = appData.trackName;
      }
    }
  }
}

/**
 * Generates a visual representation of star rating using Unicode characters
 * @param {number} rating - The rating value (0-5)
 * @returns {string} HTML string with star representation
 */
function generateStarRating(rating) {
  // Limit rating to 5 stars maximum
  const clampedRating = Math.min(5, Math.max(0, rating));
  
  // Unicode characters for stars
  const fullStar = '★'; // Filled star (U+2605)
  const emptyStar = '☆'; // Empty star (U+2606)
  
  // Round to whole number of stars
  const fullStarsCount = Math.round(clampedRating);
  
  // Generate the star display
  let starsDisplay = '';
  
  // Add filled stars
  for (let i = 0; i < fullStarsCount; i++) {
    starsDisplay += fullStar;
  }
  
  // Add empty stars
  for (let i = 0; i < (5 - fullStarsCount); i++) {
    starsDisplay += emptyStar;
  }
  
  // Add numeric rating in parentheses for clarity
  starsDisplay += ` (${clampedRating.toFixed(1)})`;
  
  return starsDisplay;
}