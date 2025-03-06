import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

import * as Base64 from "./base64.js";

var detections = [];
var imgSaveRequested = 0;

window.onload = (event) => {
    init();

    loadImg('saved_det');
}

async function init() {
    // WebWorkers use `postMessage` and therefore work with Comlink.
    const Apriltag = Comlink.wrap(new Worker("apriltag.js"));

    // must call this to init apriltag detector; argument is a callback for when the detector is ready
    window.apriltag = await new Apriltag(Comlink.proxy(() => {

        // set camera info; we must define these according to the device and image resolution for pose computation
        //window.apriltag.set_camera_info(double fx, double fy, double cx, double cy)

        window.apriltag.set_tag_size(5, .5);

        // start processing frames
        window.requestAnimationFrame(process_frame);
    }));
}

async function process_frame() {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");

    let imageData;
    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    } catch (err) {
        console.log("Failed to get video frame. Video not started ?");
        setTimeout(process_frame, 500); // try again in 0.5 s
        return;
    }
    let imageDataPixels = imageData.data;
    let grayscalePixels = new Uint8Array(ctx.canvas.width * ctx.canvas.height); // this is the grayscale image we will pass to the detector

    for (var i = 0, j = 0; i < imageDataPixels.length; i += 4, j++) {
        let grayscale = Math.round((imageDataPixels[i] + imageDataPixels[i + 1] + imageDataPixels[i + 2]) / 3);
        grayscalePixels[j] = grayscale; // single grayscale value
        imageDataPixels[i] = grayscale;
        imageDataPixels[i + 1] = grayscale;
        imageDataPixels[i + 2] = grayscale;
    }
    ctx.putImageData(imageData, 0, 0);

    det = detections[0];

    const targetId = parseInt(document.getElementById('target-node').value);
    if (det && targetId) {
        if (det.id === targetId) {
            alert("Arive!")
            window.requestAnimationFrame(process_frame);
            return;
        }

        const currentId = parseInt(det.id);
        const path = dijkstra(floorMap, currentId, targetId);
        const dir = path.directions[0];

        // // draw previous detection
        // detections.forEach(det => {
        // draw tag borders
        ctx.beginPath();
        ctx.lineWidth = "5";
        ctx.strokeStyle = "blue";
        ctx.moveTo(det.corners[0].x, det.corners[0].y);
        ctx.lineTo(det.corners[1].x, det.corners[1].y);
        ctx.lineTo(det.corners[2].x, det.corners[2].y);
        ctx.lineTo(det.corners[3].x, det.corners[3].y);
        ctx.lineTo(det.corners[0].x, det.corners[0].y);
        ctx.stroke();
        ctx.closePath();

        let dirVector = [0, 0];
        switch (dir) {
            case 'N':
                dirVector = [
                    det.corners[0].x - det.corners[1].x,
                    det.corners[0].y - det.corners[1].y
                ];
                break;
            case 'S':
                dirVector = [
                    det.corners[1].x - det.corners[0].x,
                    det.corners[1].y - det.corners[0].y
                ];
                break;
            case 'E':
                dirVector = [
                    det.corners[2].x - det.corners[1].x,
                    det.corners[2].y - det.corners[1].y
                ];
                break;
            case 'W':
                dirVector = [
                    det.corners[3].x - det.corners[0].x,
                    det.corners[3].y - det.corners[0].y
                ];
                break;
        }

        const magnitude = Math.sqrt(dirVector[0]*dirVector[0] + dirVector[1]*dirVector[1]);
        dirVector[0] /= magnitude;
        dirVector[1] /= magnitude;

        ctx.beginPath();
        ctx.moveTo(det.center.x, det.center.y);
        ctx.lineTo(det.center.x + dirVector[0] * 100, det.center.y + dirVector[1] * 100);
        ctx.strokeStyle = "green";
        ctx.lineWidth = "5";
        ctx.stroke();
        ctx.closePath();

        // draw a red circle for one of the corners
        ctx.beginPath();
        ctx.arc(det.corners[0].x, det.corners[0].y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    // detect aprilTag in the grayscale image given by grayscalePixels
    detections = await apriltag.detect(grayscalePixels, ctx.canvas.width, ctx.canvas.height);

    if (imgSaveRequested && detections.length > 0) {
        let savep = Base64.bytesToBase64(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data);
        var det = JSON.stringify({
            det_data: detections[0],
            img_data: LZString.compressToUTF16(savep),
            img_width: ctx.canvas.width,
            img_height: ctx.canvas.height
        });

        //console.log("Saving detection data.");
        localStorage.setItem("detectData", det);
        buttonToggle();
        loadImg('saved_det');
    }

    window.requestAnimationFrame(process_frame);
}

async function loadImg(targetHtmlElemId) {
    var detectData = localStorage.getItem('detectData');
    if (detectData) {
        let detectDataObj = JSON.parse(detectData);
        let savedPixels = Base64.base64ToBytes(LZString.decompressFromUTF16(detectDataObj.img_data));
        delete detectDataObj.img_data;

        const canvasSaved = document.getElementById(targetHtmlElemId + "_canvas");
        let ctx = canvasSaved.getContext("2d");
        canvasSaved.width = detectDataObj.img_width;
        canvasSaved.height = detectDataObj.img_height;
        let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        imageData.data.set(savedPixels);
        ctx.putImageData(imageData, 0, 0);

        //console.log(detectDataObj.det_data);
        let detDataSaved = document.getElementById(targetHtmlElemId + "_data");
        detDataSaved.value = JSON.stringify(detectDataObj, null, 2);
    } else console.log("detectData not found");
}

var button = document.getElementById('req_save');
button.addEventListener('click', function () {
    buttonToggle();
    //console.log("setImgSaveRequested", imgSaveRequested);
});

function buttonToggle() {
    if (imgSaveRequested == 0) {
        button.innerHTML = "Saving next detection... (press to cancel)";
        imgSaveRequested = 1;
        button.className += " active";
    } else {
        button.innerHTML = "Save next detection (local storage)";
        imgSaveRequested = 0;
        button.className.replace(" active", "");
    }
}
