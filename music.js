// ==========================================
// MÓDULO DE MÚSICA Y REPRODUCTOR ESTELAR
// ==========================================

let playlist = ['music1.mp3', 'music2.mp3', 'music3.mp3']; // Podés agregar más nombres aquí si los sumás a la carpeta
let currentTrackIndex = 0;
let isShuffle = false;
let isPlayingMusic = false;

function loadTrack(index) {
    const audio = document.getElementById('game-audio');
    if (!audio) return;
    currentTrackIndex = index % playlist.length;
    const trackName = playlist[currentTrackIndex];
    audio.src = trackName;
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) audio.volume = volSlider.value;
    audio.onended = () => { nextTrack(); };
    audio.onerror = () => { nextTrack(); };
}

function togglePlayMusic() {
    const audio = document.getElementById('game-audio');
    const btn = document.getElementById('play-pause-btn');
    if (!audio.src) loadTrack(currentTrackIndex);

    if (isPlayingMusic) {
        audio.pause();
        isPlayingMusic = false;
        btn.innerText = "▶️";
    } else {
        audio.play().then(() => {
            isPlayingMusic = true;
            btn.innerText = "⏸️";
        }).catch(e => {
            isPlayingMusic = true;
            btn.innerText = "⏸️";
        });
    }
}

function nextTrack() {
    if (isShuffle) {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlayingMusic) {
        const audio = document.getElementById('game-audio');
        if (audio) audio.play();
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-btn');
    if (btn) btn.style.color = isShuffle ? '#00f0ff' : '#94a3b8';
}

function changeVolume(val) {
    const audio = document.getElementById('game-audio');
    if (audio) audio.volume = val;
}

// Inicializar con una pista aleatoria al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const randomIndex = Math.floor(Math.random() * playlist.length);
    loadTrack(randomIndex);
});