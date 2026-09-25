//game test thing, make dvd type image bounce around
const logo = document.getElementById("test-img");

// Starting positions
let x = Math.random() * (window.innerWidth - 150);
let y = Math.random() * (window.innerHeight - 100);

// Speed/Direction vectors (Pixels moved per frame)
let xSpeed = 3; 
let ySpeed = 3;



function updatePhysics() {
  // 1. Get current dimensions of the screen and logo
  const logoWidth = logo.clientWidth;
  const logoHeight = logo.clientHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 2. Move coordinates by the speed amount
  x += xSpeed;
  y += ySpeed;

  // 3. Collision Detection (The "Interrupt" Checks)
  
  // Right & Left Wall collision
  if (x + logoWidth >= screenWidth || x <= 0) {
    xSpeed = -xSpeed; // Reverse X direction

  }

  // Bottom & Top Wall collision
  if (y + logoHeight >= screenHeight || y <= 0) {
    ySpeed = -ySpeed; // Reverse Y direction

  }

  // 4. Update the CSS positions
  logo.style.left = x + 'px';
  logo.style.top = y + 'px';

  // 5. Run the next frame natively at the monitor's refresh rate (e.g., 60Hz/144Hz)
  requestAnimationFrame(updatePhysics);
}

// Start the animation loop once the image is loaded to get its correct size
logo.onload = () => {

  updatePhysics();
};

// Fallback in case image is cached and onload doesn't fire
if (logo.complete) {

  updatePhysics();
}

// Window resizing handler to make sure it doesn't get trapped offscreen
window.addEventListener('resize', () => {
  if (x + logo.clientWidth > window.innerWidth) x = window.innerWidth - logo.clientWidth;
  if (y + logo.clientHeight > window.innerHeight) y = window.innerHeight - logo.clientHeight;
});
