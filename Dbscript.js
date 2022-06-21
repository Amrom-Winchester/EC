let req = indexedDB.open("Gallery",1);

let database;
let numberOfMedia = 0;

req.addEventListener("success",function(){
    database = req.result;
    console.log(database);
})

req.addEventListener("upgradeneeded",function(){
    let db = req.result;
    db.createObjectStore("Media",{ keyPath: "mId"});
});

req.addEventListener("error",function(){});

function saveMedia(media){
    if(!database) return;

    let data = {
        mId : Date.now(),
        mediaData : media,
    }

    let tx = database.transaction("Media","readwrite");
    let mediaObjectStore = tx.objectStore("Media");
    mediaObjectStore.add(data);
}

function viewMedia(){
    if(!database) return;

    let gContainer = document.querySelector(".gallery-container");

    let tx = database.transaction("Media","readonly");
    let mediaObjectStore = tx.objectStore("Media");

    let curReq = mediaObjectStore.openCursor();

    curReq.addEventListener("success",function(){
        cursor = curReq.result;
        if(cursor){
            numberOfMedia++;
            let mediaCard = document.createElement("div");
            mediaCard.classList.add("media-card");

            mediaCard.innerHTML = `<div class="actual-media"></div>
            <div class="media-buttons">
                <button class="media-download">Download</button>
                <button data-mId = "${cursor.value.mId}class="media-delete">Delete</button>
            </div>`

            let data = cursor.value.mediaData;

            let actualMediaDiv = mediaCard.querySelector(".actual-media");
            let downloadBtn = mediaCard.querySelector(".media-download");
            let deleteBtn = mediaCard.querySelector(".media-delete");
            deleteBtn.addEventListener("click",function(e){
                let mId = Number(e.currentTarget.getAttribute("data-mId"));
                deleteMedia(mId);
                e.currentTarget.parentElement.parentElement.remove();
            });

            let type = typeof data;

            if( type=="string" ){
                // it is a image

                let image = document.createElement("img");
                image.src = data;

                actualMediaDiv.append(image);
                downloadBtn.addEventListener("click", function () {
                    downloadMedia(data, "image");
                });

            }
            else if( type=="object" ){
                // it is a video

                let video = document.createElement("video");
                let url = URL.createObjectURL(data);

                video.src = url;

                video.autoplay = true;
                video.loop = true;
                video.controls = true;
                video.muted = true;

                actualMediaDiv.append(video);
                downloadBtn.addEventListener("click", function () {
                    downloadMedia(url, "video");
                });
            }

            gContainer.append(mediaCard);
            cursor.continue();
        }
    })
}

function downloadMedia(url,type){

    let anchor = document.createElement("a");
    anchor.href = url;
    
    if( type=="image" ){
        anchor.download = "image.png";
    }
    else{
        anchor.download = "video.mp4";
    }

    anchor.click();
    anchor.remove();
}

function deleteMedia(mId){
    let tx = database.transaction("Media", "readwrite");
    let mediaStore = tx.objectStore("Media");
    mediaStore.delete(mId);
}