const jacob_song = new Audio("assets/backgroundmusic.wav");
jacob_song.loop = true;

function play_bgmusic() {
    jacob_song.play().catch((error) => {
        console.error("Background music could not start:", error);
    });
}

document.addEventListener("click", play_bgmusic, { once: true });
document.addEventListener("keydown", play_bgmusic, { once: true });

