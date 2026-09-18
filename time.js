

// clock function

function updateClock() {
    // 1. Get the current date and time
    const now = new Date();
    
    // 2. Extract hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // 3. Add a leading zero to numbers less than 10
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    // 4. Combine them into a string format
    const timeString = `${hours}:${minutes}:${seconds}`;

    // 5. Inject the string into your HTML container
    document.getElementById('clock').textContent = timeString;

    //other functions I want to slip in here
    addRate();
    update_imgBen();

}

// Call the function immediately so the clock doesn't start blank
updateClock();

// Run the function continuously every 1 second (1000ms)
setInterval(updateClock, 1000);
