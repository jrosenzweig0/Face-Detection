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


function noiseReduce(){
    data2 = ctxE.getImageData(0,0,resx,resy);
    data1 = ctxE.getImageData(1,1,resx-1, resy-1);
    let count = 0;
    for (let i = 0; i < data2.data.length; i+=4){
        if(i<resx*4 || i > data2.data-resx*4 || i%resx*4 == 0 || i%resx*4 == resx*4-4){
            continue
        }
        if (i==8000){
            console.log(data2.data[i]==data1.data[count]);
        }
        else if(data2.data[i]==data1.data[count]){
            if (data2.data[i-1]+data2.data[i+1]+data2.data[i+resx-1]+data2.data[i+resx]+data2.data[i+resx+1]+data2.data[i-resx+1]+data2.data[i-resx]+data2.data[i-resx-1] <(2*255)+1) {
                data1.data[count] = data1.data[count+1] = data1.data[count+2] = 0;
            }
            count+=4;
        }
        else{
            console.log("error");
        }
    }
    ctx.putImageData(data1,1,1);

}


function draw() {
    //ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);
    let count = 0;
    for(let j = 0; j < resy; j++){
        for(let i = 0; i < resx; i++){
            if(videoOut[j][i] < 0.05){
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
    
}



function animate() {
    //ctx.clearRect(0,0,w,h);
    //ctxE.clearRect(0,0,w,h);
    update();
    totalder(xder(),yder());
    draw();
    requestAnimationFrame(animate);
}
animate();