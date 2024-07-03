document.addEventListener("DOMContentLoaded", () => {
    console.log("Let's begin javascript");

    function convertSecToMinSec(seconds) {
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const formattedSecs = secs < 10 ? `0${secs}` : secs;
        return `${mins}:${formattedSecs}`;
    }

    const seconds = 125;
    // console.log(convertSecToMinSec(seconds));

    let songs = [];
    let currfolder;
    let CurrentSong = new Audio();

    async function getsongs(folder) {
        currfolder = folder;
        let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
        if (!a.ok) {
            console.error(`Error fetching songs: ${a.statusText}`);
            return [];
        }
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];  // Fixed re-declaration of songs variable
        for (let index = 1; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
            }
        }
        let SongUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
        SongUl.innerHTML = "";
        for (let index = 0; index < songs.length; index++) {
            const song = songs[index];
            SongUl.innerHTML = SongUl.innerHTML + `<li>
                <img class="invert" src="assets/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Song Artist</div>
                </div>
                <img src="assets/play.svg" alt="">
            </li>`;
        }

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playMusic(songName);
            });
        });
    }

    const playMusic = (track, pause = false) => {
        CurrentSong.src = `/${currfolder}/` + track;
        const playButton = document.getElementById("play");
        if (!pause) {
            CurrentSong.play();
            playButton.src = "pause.svg";
        } else {
            CurrentSong.pause();
            playButton.src = "play.svg";
        }
        document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
        document.querySelector(".songtime").innerHTML = "00:00/00:00";
    };

    async function displayAlbums() {
        let a = await fetch(`http://127.0.0.1:3000/songs`);
        if (!a.ok) {
            console.error(`Error fetching songs: ${a.statusText}`);
            return [];
        }
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

            let cardcontainer = document.querySelector(".cardcontainer")
            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-2)[0];

                //To get metadata
                let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let response = await a.json();
                console.log(response)
                cardcontainer.innerHTML = cardcontainer.innerHTML + `  <div data-folder="${folder}" class="card rounded">
                        <img src="/songs/${folder}/cover.jpg">
                        <div class="play">
                            <img src="assets/a.svg" alt="">
                        </div>
                        <h4>${response.Title}</h4>
                        <p>${response.description}</p>
                    </div>`
            }
        }
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log(item.currentTarget, item.currentTarget.dataset.folder);
                await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            });
        });
    }

    async function main() {
        await getsongs("songs/TopPicks");  // Corrected folder name
        displayAlbums();

        const playButton = document.getElementById("play");
        if (playButton) {
            playButton.addEventListener("click", () => {
                if (CurrentSong.paused) {
                    CurrentSong.play();
                    playButton.src = "pause.svg";
                } else {
                    CurrentSong.pause();
                    playButton.src = "play.svg";
                }
            });
        }
    }

    CurrentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecToMinSec(CurrentSong.currentTime)}/${convertSecToMinSec(CurrentSong.duration)}`;
        document.querySelector(".circle").style.left = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
    });

    const seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            CurrentSong.currentTime = (CurrentSong.duration * percent) / 100;
        });
    }

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let currentSongName = decodeURIComponent(CurrentSong.src.split("/").pop());
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentSongName = decodeURIComponent(CurrentSong.src.split("/").pop());
        let index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").addEventListener("change", (e) => {
        CurrentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume").addEventListener("click", (e) => {
        const volumeIcon = e.target;
        if (volumeIcon.src.includes("assets/volume.svg")) {
            volumeIcon.src = volumeIcon.src.replace("assets/volume.svg", "assets/mute.svg");
            CurrentSong.volume = 0;
            document.querySelector(".range").value = 0;
        } else {
            volumeIcon.src = volumeIcon.src.replace("assets/mute.svg", "assets/volume.svg");
            CurrentSong.volume = 0.1;
            document.querySelector(".range").value = 10;
        }
    });

    main();  // Call the main function
});
