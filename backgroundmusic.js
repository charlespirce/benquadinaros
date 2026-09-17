//loop the SOngee.wav

const jacob_song = new Audio("mixkit-mouse-click-close-1113.wav"); //jacob audio?

function play_bgmusic(){
    jacob_song.play();
}

const intervalId = setInterval(play_bgmusic, 51000); //call function every 51 seconds