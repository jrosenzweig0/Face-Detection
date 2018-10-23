var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

canvas.width = w = window.innerWidth;
canvas.height = h = window.innerHeight;

var canvasExperimental = document.createElement("canvas");
var ctxE = canvasExperimental.getContext("2d");

canvasExperimental.width = window.innerWidth;
canvasExperimental.height = window.innerHeight;



const resx = 600;
const resy = 400;

const thresh = 0.05;

//Create video element and acess the webcam video 
var video = document.createElement("video");

if (navigator.mediaDevices.getUserMedia) {  
    navigator.mediaDevices.getUserMedia({video: {width: resx, height: resy}})
        .then(stream => {
            video.srcObj = stream;
            video.src = window.URL.createObjectURL(stream);
            video.onloadedmetadata = function(e) {
                video.play();
            };
        })
        .catch(err => console.log(err));
}

//my code starts here 
videoData = [];
videoOut = [];

for(let j = 0; j < resy; j++){
    videoOut.push([]);
    for(let i = 0; i < resx; i++){
        videoOut[j].push(0);
    }
}

function update(){
    videoData = [];
    ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);
    let count = 0;
    for(let j = 0; j < resy; j++){
        videoData.push([]);
        for(let i = 0; i < resx; i++){
            videoData[j].push((0.2126*data.data[count] + 0.7152*data.data[count+1] + 0.0722*data.data[count+2])/255);
            count += 4;
        }
    }
}

function xder(){
    let array = [];
    for(let j = 0; j < resy; j++){
        array.push([]);
        for(let i = 0; i < resx; i++){
            array[j].push(0);
        }
    }
    for(let j = 0; j < videoData.length; j++){
        for(let i = 0; i < videoData[0].length; i++){
            if(i == videoData[0].length -1){
                array[j][i] = 0;
            }
            else{
                array[j][i] = Math.abs(videoData[j][i] - videoData[j][i+1]);
            }
        }
    }
    return array;
}

function yder(){
    let array = [];
    for(let j = 0; j < resy; j++){
        array.push([]);
        for(let i = 0; i < resx; i++){
            array[j].push(0);
        }
    }

    for(let j = 0; j < videoData.length; j++){
        for(let i = 0; i < videoData[0].length; i++){
            if(j == videoData.length -1){
                array[j][i] = 0;
            }
            else{
                array[j][i] = Math.abs(videoData[j][i] - videoData[j+1][i]);
            }
        }
    }
    return array;
}

function totalder(x,y){
    for(let j = 0; j < resy; j++){
        for(let i = 0; i < resx; i++){
            videoOut[j][i] = (x[j][i] + y[j][i])/2;
        }
    }
}



function draw() {
    //ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);
    let count = 0;
    for(let j = 0; j < resy; j++){
        for(let i = 0; i < resx; i++){
            if(videoOut[j][i] < thresh){
                data.data[count]=0;
                data.data[count+1]=0;
                data.data[count+2]=0;
                data.data[count+3]=255;
            }
            else{
                data.data[count]=255;
                data.data[count+1]=255;
                data.data[count+2]=255;
                data.data[count+3]=255;
            }
            count += 4;
        }
    }
    ctxE.clearRect(0,0,w,h);
    ctx.putImageData(data,0,0);
}

function erosion(){
    for(let j = 0; j < resy; j++){
        for(let i = 0; i < resx; i++){
            if(videoOut[j][i] < thresh){
                videoOut[j][i] = 0;
            }
            else{
                videoOut[j][i] = 1;
            }
        }
    }
    for(let j = 0; j < resy; j++){
        for(let i = 0; i < resx; i++){
            if(i == 0 || j == 0|| i == resx-1 || j == resy-1){
                continue;
            }
            let sum = videoOut[j+1][i]+videoOut[j-1][i]+videoOut[j][i+1]+videoOut[j][i-1]+videoOut[j+1][i+1]+videoOut[j+1][i-1]+videoOut[j-1][i+1]+videoOut[j-1][i-1];
            if(sum < 1){
                videoOut[j][i] = 0;
            }

        }
    }
}

function draw_graph(){
    let sum = 0;
    for(let i = 0; i < resx; i++){
        sum = 0;
        for(let j = 0; j < resy; j++){
            sum = sum + videoOut[j][i];
        }
        ctx.fillRect(i,resy,1,sum);
    }

    for(let j = 0; j < resy; j++){
        sum = 0;
        for(let i = 0; i < resx; i ++){
            sum = sum + videoOut[j][i];
        }
        ctx.fillRect(resx,j,sum,1);
        ctx.fillStyle = "blue";
    }
}



function animate() {
    ctx.clearRect(0,0,w,h);
    //ctxE.clearRect(0,0,w,h);
    update();
    totalder(xder(),yder());
    erosion();
    draw_graph();
    draw();
    requestAnimationFrame(animate);
}
animate();