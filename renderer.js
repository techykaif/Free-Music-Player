const { ipcRenderer , dialog } = require("electron");
const path=require('path');
let tracks=[];
// Add event listeners first
ipcRenderer.on('load-home', () => {
    navigateToHome();
});
// Then define the functions
const homeButton = document.getElementById('homeButton');
homeButton.addEventListener('click', () => {
    navigateToHome();
});
let content = document.getElementById('content');

function navigateToHome() {
    content.innerHTML = '<h1 align="center">My Music Player</h1>';
    content.style.backgroundImage = 'url(icon.jpg)';
    content.style.backgroundSize = '400px 400px';
    content.style.backgroundPosition = 'center';
    content.style.color = 'white';
    content.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Add a semi-transparent background color to improve contrast
}


/////new Functionalites

const addButton = document.getElementById('addButton');
addButton.addEventListener('click', openFileExplorer);

function openFileExplorer() {
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Music Files', extensions: ['mp3', 'wav', 'ogg', 'flac'] },
        ],
    }).then((result) => {
        if (!result.canceled) {
            const files = result.filePaths;
            displayMusicFiles(files); // Call the function to display music files
        }
    }).catch((err) => {
        console.error("Error while opening file Explorer:", err);
    });
}

function displayMusicFiles(files) {
    let musicList = content.querySelector('.music-list');

    // If musicList doesn't exist, create a new one
    if (!musicList) {
        musicList = document.createElement('ul');
        musicList.classList.add('music-list');
        content.innerHTML = '<h1 align="center">Music Files</h1>'; // Clear the content
        content.style.color = 'white';
        content.style.backgroundImage = '';
        content.appendChild(musicList); // Append the list of music files
    }
    tracks=[];

    files.forEach((file) => {
        const fileName = path.basename(file);
        const listItem = document.createElement('li');
        listItem.textContent = fileName;

        // Add CSS class to the list item
        listItem.classList.add('music-list-item');

        // Add event listener to play audio when list item is clicked
        listItem.addEventListener('click', () => {
            playAudio(file);
        });

        musicList.appendChild(listItem);
        if (!tracks.some(track => track.path === file)) {
            tracks.push({ path: file });
        }
    });
}

let audioPlayer; // Declare audioPlayer variable outside the function scope
let seekBar; // Declare seekBar variable to reference the seek bar element
let currentTimeDisplay; // Declare variable to reference current time display element
let durationDisplay; // Declare variable to reference duration display element

function playAudio(file) {
    // Pause the current audio player if it exists
    if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
    }

    // Create a new audio player for the current file
    audioPlayer = new Audio(file);
    
    // Listen for the 'ended' event to start playing the next file
    audioPlayer.addEventListener('ended', playNextAudio);

    // Update seek bar position while playing
    audioPlayer.addEventListener('timeupdate', updateSeekBar);


    // Start playback
    audioPlayer.play();
    currentTrackIndex = tracks.findIndex(track => track.path === file);
}

function playNextAudio() {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
        const nextFile = tracks[nextIndex].path;
        playAudio(nextFile); // Start playing the next audio file
    }
}

function updateSeekBar() {
    if (!seekBar) {
        seekBar = document.getElementById('seekBar'); // Get the seek bar element
        seekBar.addEventListener('input',seekToPosition);
    }
    if (!currentTimeDisplay) {
        currentTimeDisplay = document.getElementById('currentTime'); // Get the current time display element
    }
    if (!durationDisplay) {
        durationDisplay = document.getElementById('duration'); // Get the duration display element
    }

    if (audioPlayer) {
        const currentTime = audioPlayer.currentTime; // Get current playback time
        const duration = audioPlayer.duration; // Get audio duration
        const percentage = (currentTime / duration) * 100; // Calculate percentage of playback

        // Update the value of the seek bar
        seekBar.value = percentage;

        // Update current time display
        currentTimeDisplay.textContent = formatTime(currentTime);

        // Update duration display
        durationDisplay.textContent = formatTime(duration);
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function seekToPosition() {
    if (audioPlayer && seekBar) {
        const percentage = seekBar.value;
        const duration = audioPlayer.duration;
        const newTime = (percentage / 100) * duration;
        
        // Set the playback position of the audio to the new time
        audioPlayer.currentTime = newTime;
    }
}

const volumeSlider=document.getElementById('volumeSlider');
const volumeDisplay=document.getElementById('volumeDisplay');
volumeSlider.addEventListener('input',()=>{
    const volume=volumeSlider.value;
    volumeDisplay.textContent=`${volume}%`;
    updateVolume(volume);
});
function updateVolume(volume){
    if(audioPlayer){
        audioPlayer.volume=volume/100;

    }
}
updateVolume(100);
const muteButton=document.getElementById('volumeControl');

muteButton.addEventListener('click',()=>{
    if(audioPlayer){
        audioPlayer.muted=!audioPlayer.muted;
        muteButton.textContent=audioPlayer.muted ? 'Unmute' : 'Mute';
        changeImage(audioPlayer.muted);
    }
});
function changeImage(isMuted){
    if(isMuted){
        muteButton.src='volume-mute.png';
    }
    else{
        muteButton.src='medium-volume.png';
    }
    
}
const playPauseButton=document.getElementById('playPauseController');
const playPauseImage=document.getElementById('playPauseImage');
playPauseButton.addEventListener('click',()=>{
    if(audioPlayer){
        if(audioPlayer.paused){
            audioPlayer.play();
            playPauseImage.src='pause.png';

        }
        else{
            audioPlayer.pause();
            playPauseImage.src='now-playing.png';
        }
    }
});
// Assuming audioPlayer and tracks are properly defined

const nextButton = document.getElementById('nextButton');
const previousButton = document.getElementById('previousButton');

let currentTrackIndex = 0;

nextButton.addEventListener('click', () => {
  if (audioPlayer && tracks.length > 1) {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    audioPlayer.src = tracks[currentTrackIndex].path;
    audioPlayer.play();
  }
});

previousButton.addEventListener('click', () => {
  if (audioPlayer && tracks.length > 1) {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    audioPlayer.src = tracks[currentTrackIndex].path;
    audioPlayer.play();
  }
});

const speedSelector = document.getElementById('speedSelector');

speedSelector.addEventListener('change', () => {
  const selectedSpeed = parseFloat(speedSelector.value);
  if (audioPlayer) {
    audioPlayer.playbackRate = selectedSpeed;
  }
});



addButton.addEventListener('click',()=>{
  ipcRenderer.send('add-music');
})
ipcRenderer.on('display-music-files',(event,files)=>{
    console.log("Recieved Files:",files);
    displayMusicFiles(files);
});