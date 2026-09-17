//loop the SOngee.wav

const jacob_song = new Audio("SOngee.wav"); //jacob audio?

function play_bgmusic(){
    jacob_song.play();
    console.log("playing background music");
};

play_bgmusic();//play the audio

const backgroundmusicID = setInterval(play_bgmusic, 51000); //call function every 51 seconds

