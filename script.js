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