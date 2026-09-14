// get html elements
const clickCount = document.getElementById('click-count'); //click count
const ben_img = document.getElementById("ben-img"); //image id

// load storage
let clicks = localStorage.getItem("clicks") || 0;

clickCount.textContent = clicks; //update html display


// event listeners

ben_img.addEventListener("click", () => {
    clicks++; //increment click count
    clickCount.textContent = clicks; //update html display
    localStorage.setItem("clicks", clicks); //save to local storage
});