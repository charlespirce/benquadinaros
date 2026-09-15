// get html elements
const clickCount = document.getElementById('click-count'); //click count
const ben_img = document.getElementById("ben-img"); //image id
const jacob_song = new Audio("mysongo.wav"); //jacob audio?
// load storage
let clicks = localStorage.getItem("totalClicks") || 0;

clickCount.textContent = clicks; //update html display


// event listeners

ben_img.addEventListener("click", () => {
    jacob_song.play(); // play audio
    clicks++; //increment click count
    clickCount.textContent = clicks; //update html display
    localStorage.setItem("totalClicks", clicks); //save to local storage
});