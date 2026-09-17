// get html elements
const clickCount = document.getElementById('click-count'); //click count
const ben_img = document.getElementById("ben-img"); //image id
const click_noise = new Audio("mixkit-mouse-click-close-1113.wav"); //click noise

// load storage
let clicks = localStorage.getItem("totalClicks") || 0;
let rat_cost = 20; //Initial cost of 1 ratts tyerell

clickCount.textContent = clicks; //update html display


// event listeners

ben_img.addEventListener("click", () => {
    click_noise.play();
    clicks++; //increment click count
    clickCount.textContent = clicks; //update html display
    localStorage.setItem("totalClicks", clicks); //save to local storage
});

rat_button.addEventListener("click", () => {
    click_noise.play();
    if (clicks >= rat_cost) {
        clicks -= rat_cost; //deduct cost
        rat_cost = Math.floor(rat_cost * 1.2); //increase cost by 20%
        clickCount.textContent = clicks; //update html display
        localStorage.setItem("totalClicks", clicks); //save to local storage
    }
});