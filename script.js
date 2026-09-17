// get html elements
const clickCount = document.getElementById('click-count'); //click count
const ben_img = document.getElementById("ben-img"); //image id
const click_noise = new Audio("mixkti-mouse-click-close-1113.wav"); //click noise

// load storage
let clicks = localStorage.getItem("totalClicks") || 0;

clickCount.textContent = clicks; //update html display


// event listeners

ben_img.addEventListener("click", () => {
    click_noise.play();
    clicks++; //increment click count
    clickCount.textContent = clicks; //update html display
    localStorage.setItem("totalClicks", clicks); //save to local storage
});
