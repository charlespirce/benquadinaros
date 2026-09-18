// get html elements
const clickCount = document.getElementById('click-count'); //click count
const ben_img = document.getElementById("ben-img"); //image id
const click_noise = new Audio("mixkit-mouse-click-close-1113.wav"); //click noise
const reset_button = document.getElementById('reset-clicks');
const disp_rate = document.getElementById("display-rate");
//rat
const ratCount = document.getElementById("rats-owned"); //rat count
const ratCost = document.getElementById("rat-cost"); //rat cost
const ratRate = 1 //1 rat = 1 clicks/s
//PolyBen
const polyben_text = document.getElementById("polyben-text");
const polyben_button_img = document.getElementById("polyben_button_img");


// load storage
let clicks = localStorage.getItem("totalClicks") || 0;
let rat_cost = localStorage.getItem("rat-cost") || 20; //Initial cost of 1 ratts tyerell
let rats = localStorage.getItem("rats-owned") || 0; //Number of Ratts Tyerells owned
let polyben_unlocked= localStorage.getItem("polyben_unlocked") || false;

clickCount.textContent = clicks; //update html display
ratCount.textContent = rats; //update html display
ratCost.textContent = rat_cost; //update html display

//var
let totalRate = ratRate * rats //add other rates here


//functions
function update_rate(){
    totalRate = ratRate * rats;
    disp_rate.textContent = totalRate;
}

update_rate();

function addRate() {
    clicks = +clicks + +totalRate
    clickCount.textContent = clicks;
}
function update_polyben_text(){
    if (polyben_unlocked) {
        polyben_text.textContent = "Switch to PolyBen";
    }
}
update_polyben_text();
//udpate html & storage
function update_imgBen() {
    clickCount.textContent = clicks; //update html display
    localStorage.setItem("totalClicks", clicks); //save to local storage
}

function secondLoop() {
    addRate();
    update_imgBen();
}


secondLoop();
setInterval(secondLoop, 1000);


// event listeners

ben_img.addEventListener("click", () => {
    click_noise.play();
    clicks++; //increment click count
    update_imgBen();
});


rat_button.addEventListener("click", () => {
    click_noise.play();
    if (clicks >= rat_cost) {
        clicks -= rat_cost; //deduct cost
        rat_cost = Math.floor(rat_cost * (1.2)); //increase cost by 20%
        clickCount.textContent = clicks; //update html display
        localStorage.setItem("totalClicks", clicks); //save to local storage
        localStorage.setItem("rat-cost", rat_cost); //save new cost to local storage
        ratCost.textContent = rat_cost; //update html display
        rats++; //increment Ratts Tyerell count
        ratCount.textContent = rats; //update html display
        localStorage.setItem("rats-owned", rats); //save to local storage
        update_rate();
    }
    update_rate();
});

polyben_button.addEventListener("click", () => {
    click_noise.play();
    if (clicks >=1000 && !polyben_unlocked) {
        clicks -= 1000;
        update_imgBen();
        polyben_unlocked = true;
        localStorage.setItem("polyben_unlocked", true);
        polyben_text.textContent = "Switch to PolyBen";
    }
    if (polyben_unlocked) {
        if (ben_img.src.includes("ben.png")){
            ben_img.src="benquad.png";
            polyben_button_img.src="ben.png";
            polyben_text.textContent = "Switch to Ben";
        }
        else {
            ben_img.src="ben.png";
            polyben_button_img.src="benquad.png";
            polyben_text.textContent = "Switch to PolyBen";
        }
    }

});

reset_button.addEventListener("click", () => {
    clicks = 0;
    localStorage.setItem("totalClicks", 0);
    update_imgBen();
});