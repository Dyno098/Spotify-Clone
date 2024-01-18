console.log("ello world")
let currentsongs=new Audio();
let songs;
let currfolder;
async function getsongs(folder){
    currfolder=folder
    let a= await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    console.log(response)
    let div= document.createElement("div")
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
    songs=[]
    for (let i= 0;i<as.length; i++){
        const element =as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML=" "
    for(const song of songs){
       songUL.innerHTML =songUL.innerHTML + `<li> <img class="invert" width="34" src="music.svg" alt="">
       <div class= "info">
         <div> ${song.replaceAll("%20"," ")}</div>
       
       </div>
       <div class="playnow">
       <span>Play now</span>
        <img class="invert" src="play.svg" alt=" ">
        </div>
        </li>`
    }
    //add event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
       e.addEventListener("click", element=>{
       console.log(e.querySelector(".info").firstElementChild.innerHTML)
       playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
       })
    })
    
}
function secondsToMinutesSeconds(seconds) {
   if (isNaN(seconds)|| seconds<0){
    return"invalid input"
   }
   const minute=Math.floor(seconds/60);
   const remainingSeconds= Math.floor(seconds%60);
   const formattedminute = String(minute).padStart(2,'0');
   const formattedsecons= String(remainingSeconds).padStart(2,'0');

   return `${formattedminute}:${formattedsecons}`;
}

const playmusic =(track, pause=false)=>{
    // var audio = new Audio("/songs/" + track);
    currentsongs.src=`/${currfolder}/` + track
    if(!pause){
        currentsongs.play()
        play.src="pause.svg"
    }
   
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00/00:00"
}
async function displayAlbums(){
    let a= await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    console.log(response)
    let div= document.createElement("div")
    div.innerHTML=response;
    let anchors = div.getElementsByTagName("a")
    console.log(anchors)
    let cardcontainer= document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
     for (let i=0 ;i < array.length; i++){
        const e= array[i];
        if(e.href.includes("/songs")){
            let folder= e.href.split("/").slice(-2)[0]
            let a= await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML+ `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <!-- Circle background -->
                    <circle cx="12" cy="12" r="11" fill="#4CAF50" stroke="#141B34" stroke-width="1.5" />

                    <!-- Play button -->
                    <path d="M9 6L16.5 12L9 18V6Z" fill="#141B34" />
                </svg>

            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            const folder = event.currentTarget.dataset.folder;
    
            // Make sure getsongs is an asynchronous function that returns a Promise
            try {
                const songs = await getsongs(`songs/${folder}`);
                // Do something with the retrieved songs
                console.log(songs);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        });
    });
    
}
async function main(){
      
     await getsongs("songs/ncs")
     playmusic(songs[0],true)
     console.log(songs)
     //display all the albums
     await displayAlbums()
   
     // attach an event listener to play, next, previous
     play.addEventListener("click", ()=>{
        if(currentsongs.paused){
            currentsongs.play()
            play.src="pause.svg"
        }
        else{
            currentsongs.pause()
            play.src="play.svg"
        }
     })
    // listen for timeupdate event
    currentsongs.addEventListener("timeupdate", ()=>{
        console.log(currentsongs.currentTime, currentsongs.duration);
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsongs.currentTime)}/
        ${secondsToMinutesSeconds(currentsongs.duration)}`
        document.querySelector(".circle").style.left=(currentsongs.currentTime/currentsongs.duration)*100 + '%'
    })
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent =(e.offsetX/e.target.getBoundingClientRect()
        .width)*100;
        document.querySelector(".circle").style.left= percent + "%";
        currentsongs.currentTime=((currentsongs.duration)*percent)/100
    })
    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
          document.querySelector(".left").style.left="0"
    })
    //for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
  })
  previous.addEventListener("click", ()=>{
    currentsongs.pause()
    console.log("previus was clicked")
    let index= songs.indexOf(currentsongs.src.split("/").slice(-1)[0])
    if((index-1)>=0){
        playmusic(songs[index-1])
    }
  })

  next.addEventListener("click", ()=>{
    currentsongs.pause()
    console.log("Next was clicked")
    let index= songs.indexOf(currentsongs.src.split("/").slice(-1)[0])
    if((index+1)<songs.length){
        playmusic(songs[index+1])
    }
  })

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
   (e)=>{
    currentsongs.volume=parseInt(e.target.value)/100
   })
}

main()  
