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
function update(){
    videoData = [];
    ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);
    let count = 0;
    for(let j = 0; j < resy; j++){
        videoData.push([]);
        for(let i = 0; i < resx; i+=4){
            videoData[j].push((0.2126*data.data[count] + 0.7152*data.data[count+1] + 0.0722*data.data[count+2])/255);
            count += 4;
        }
    }
}

videoDataCurrent = [];
videoDataPast = [];

function xderavitive(){
    ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);
    array = [];
    for (let i = 0; i<data.data.length; i++){
        videoDataCurrent[i] = data.data[i];
    }
    try {
        for (let i = 0; i < videoDataCurrent.length-4; i += 4) {
            difference = Math.abs(videoDataCurrent[i] - videoDataCurrent[i+4]) + Math.abs(videoDataCurrent[i+1] - videoDataCurrent[i+5])+ Math.abs(videoDataCurrent[i+2] - videoDataCurrent[i+6]);
            if (difference > 20){
                data.data[i] = data.data[i+1] = data.data[i+2] = 255;
                array.push(1);

            }
            else{
                data.data[i] = data.data[i+1] = data.data[i+2] = 0;
                array.push(0);
            }
        }

        ctxE.clearRect(0,0,w,h);
        ctx.putImageData(data,0,0);
    }
    catch (e) {
        console.log(e);
        return;
    }
}

function tderivative(){
    ctxE.drawImage(video,0,0,resx,resy);
    let data = ctxE.getImageData(0,0,resx,resy);

    array = [];
    for (let i = 0; i<data.data.length; i++){
        videoDataCurrent[i] = data.data[i];
    }
    try {
        for (let i = 0; i < videoDataCurrent.length; i += 4) {
            difference = Math.abs(videoDataCurrent[i] - videoDataPast[i]) + Math.abs(videoDataCurrent[i+1] - videoDataPast[i+1])+ Math.abs(videoDataCurrent[i+2] - videoDataPast[i+2]);
            if (difference > 80){
                data.data[i] = data.data[i+1] = data.data[i+2] = 255;
                array.push(1);

            }
            else{
                data.data[i] = data.data[i+1] = data.data[i+2] = 0;
                array.push(0);
            }
        }

        ctxE.clearRect(0,0,w,h);
        ctx.putImageData(data,0,0);
        //noiseReduce();
    }
    catch (e) {
        console.log(e);
        return;
    }
    // let count = 0;
    // let sum = 0;
    // for(let i = 0; i < resy; i++){
    // 	for(let j = 0; j < resx; j++){
    // 		sum = sum + array[count];
    // 		count += 1;
    // 	}
    // 	console.log(i + ": sum = " + sum);
    // }
    for (let i = 0; i<videoDataCurrent.length; i++){
        videoDataPast[i] = videoDataCurrent[i];
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

}



function animate() {
    //ctx.clearRect(0,0,w,h);
    //ctxE.clearRect(0,0,w,h);
    update()
    draw()
    requestAnimationFrame(animate);
}
animate();