        let body = document.querySelector("body");
        let videoPlayer = document.querySelector("video");
        let recordBtn = document.querySelector("#record");
        let captureBtn = document.querySelector("#capture");
        let mediaRecorder;  
        let chunks = [];
        let isRecording = false;
        let filter = "";
        let currZoom = 1; // min = 1 and max = 3

        let zoomIn = document.querySelector(".in");
        let zoomOut = document.querySelector(".out");

        zoomIn.addEventListener("click",function () {
            currZoom = currZoom + 0.1;
            if( currZoom>3 ) currZoom = 3;
            videoPlayer.style.transform = `scale(${currZoom})`;
        })

        zoomOut.addEventListener("click",function(){
            currZoom = currZoom - 0.1;
            if( currZoom<1 ) currZoom = 1;
            videoPlayer.style.transform = `scale(${currZoom})`;
        })

        let allFilters = document.querySelectorAll(".filter");

        for( let i = 0; i<allFilters.length; i++ ){
            allFilters[i].addEventListener("click",function(e){
                let previousFilter = document.querySelector(".filter-div");

                if(previousFilter){
                    previousFilter.remove();
                }

                let color = e.currentTarget.style.backgroundColor;
                filter = color;
                let div = document.createElement("div");
                div.classList.add("filter-div");
                div.style.backgroundColor = color;
                body.append(div);
            });
        }

        recordBtn.addEventListener("click",function(){
            let innerSpan = recordBtn.querySelector("span");

            let previousFilter = document.querySelector(".filter-div");
            if(previousFilter)  previousFilter.remove();

            if(isRecording){
                // if the video is being recorded , then the recording will stop
                mediaRecorder.stop();
                isRecording = false;
                innerSpan.classList.remove("record-animation");
            }
            else{
                // if the video is not being recorded , then the recording will start
                mediaRecorder.start();
                currZoom = 1;
                videoPlayer.style.transform = `scale(${currZoom})`;
                isRecording = true;
                innerSpan.classList.add("record-animation")
            }
        });

        // Photo Capture Button Working
        captureBtn.addEventListener("click",function(){
            let innerSpan = captureBtn.querySelector("span");
            innerSpan.classList.add("capture-animation");
            setTimeout(function(){
                innerSpan.classList.remove("capture-animation");
            },1000);

            let canvas = document.createElement("canvas");
            canvas.height = videoPlayer.videoHeight;
            canvas.width = videoPlayer.videoWidth;
            
            let tool = canvas.getContext("2d");

            // shift the top left corner which is by default origin to the centre of canvas
            tool.translate(canvas.width/2,canvas.height/2);
            // zoom will basically stretch the canvas in the give value of x and y-axis
            tool.scale(currZoom,currZoom);
            // again shift the origin to the top left of canbas from the centre
            tool.translate(-canvas.width/2,-canvas.height/2);

            tool.drawImage(videoPlayer,0,0);

            if( filter!="" ){
                tool.fillStyle = filter;
                tool.fillRect(0,0,canvas.height,canvas.width);
            }

            let url = canvas.toDataURL();
            canvas.remove();

            saveMedia(url);

            // let a = document.createElement("a");
            // a.href = url;
            // a.download = "image.png";
            // a.click();
            // a.remove();
        })

        // This will return promise , if any of the value of either video or audio is false, then it wont
        // proceed further with then and the error will be caught in catch function
        // getUserMedia -> It is a function which ask for permission from the user for the browser to be
        // able to use camera and audio , if permission is given then it will return a promise , if not
        // then it will be caught as an error
        let promiseToUseCamera = navigator.mediaDevices.getUserMedia({
            video : true,
            audio : true,
        });

        promiseToUseCamera.then(function(mediaStream){
            videoPlayer.srcObject = mediaStream;

            // mediaRecorder is an object of mediaStream which is again an object consisting of audio and video
            //  MediaRecorder is a web API given to us by browser to record the video in chunks
            mediaRecorder = new MediaRecorder(mediaStream);

            // data-available is an event of MediaRecorder
            mediaRecorder.addEventListener("dataavailable",function(e){
                // pushing the chunks of video in an array to make it a single video as long as the data is available
                chunks.push(e.data);
            });

            mediaRecorder.addEventListener("stop",function(e){
                // creating a Blob , which is used to store large raw files in the browser
                let blob = new Blob(chunks,{type : "video/mp4"});
                chunks=[];

                saveMedia(blob);

                // creating the link of the blob that was created
                // let link = URL.createObjectURL(blob);

                // creating a download link and downloading the video which is recorded
                // let a = document.createElement("a");
                // a.href = link;
                // a.download = "video.mp4";
                // a.click();
                // a.remove();
            })
            console.log("User has given access to use the camera");
            console.log(mediaStream);
        })
        .catch(function(){
            console.log("User has denied the access of camera");
        })

        let galleryBtn = document.querySelector("#gallery");

        galleryBtn.addEventListener("click",function(){
            location.assign("gallery.html");
        })