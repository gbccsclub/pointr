import { isMostSignificantTag, idToTags, tagsToId } from './utils.js';

export default class App {
    constructor() {
        this.apriltag = null;
        this.detections = [];

        this.video = document.createElement("video");
        this.video.autoplay = true;
        navigator.mediaDevices.getUserMedia({
            video: true,
            // For mobile devices, use the following constraints to access the back camera
            // { facingMode: { exact: "environment" }},
        }).then(stream => {
            this.video.srcObject = stream;
            document.getElementById('msg').innerHTML = "Camera access successful";
        }).catch(err => {
            document.getElementById('msg').innerHTML = `Error accessing webcam: ${err.name}, ${err.message}`;
        });

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async setApriltagObj(apriltag) {
        this.apriltag = apriltag;
    }

    async run() {
        if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) return;
        this.displayWebcamVideo();
        const grayscalePixels = this.getGrayscaleFrame();
        // rendering code has to be before detection because of the await call
        if (this.detections.length > 0) this.onDetection(this.detections);
        this.detections = await this.apriltag.detect(grayscalePixels, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    onDetection(detections) {
        detections.forEach(detection => {
            this.visualizeDetection(detection);
            this.visualizeDetectionCorners(detection);
            this.visualizeDetectionId(detection);
        });

        if (detections.length !== 2) return;

        const [tag1, tag2] = detections;
        const id = tagsToId(tag1.id, tag2.id);
        this.visualizeFinalId(tag1, tag2, id);
    }

    visualizeFinalId(tag1, tag2, id) {
        const radius1 = isMostSignificantTag(tag1.id) ? 10: 5; 
        this.ctx.beginPath();
        this.ctx.arc(tag1.center.x, tag1.center.y, radius1, 0, Math.PI * 2);
        this.ctx.fillStyle = isMostSignificantTag(tag1.id) ? 'red' : 'blue';
        this.ctx.fill();
        this.ctx.closePath();

        const radius2 = isMostSignificantTag(tag2.id) ? 10: 5; 
        this.ctx.beginPath();
        this.ctx.arc(tag2.center.x, tag2.center.y, radius2, 0, Math.PI * 2);
        this.ctx.fillStyle = isMostSignificantTag(tag2.id) ? 'red' : 'blue';
        this.ctx.fill();
        this.ctx.closePath();

        const { x, y } = { 
            x: (tag1.center.x + tag2.center.x) / 2,
            y: (tag1.center.y + tag2.center.y) / 2,
        };
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(id, x, y);
    }

    visualizeFinalIdText(tag1, tag2, id) {
        const { x, y } = tag1.center;
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(id, x, y);
    }

    visualizeDetection(detection) {
        const corners = detection.corners;
        this.ctx.beginPath();
        this.ctx.moveTo(corners[0].x, corners[0].y);
        corners.forEach(({ x, y }) => {
            this.ctx.lineTo(x, y);
        });
        this.ctx.lineTo(corners[0].x, corners[0].y);
        this.ctx.strokeStyle = 'lightgreen';
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    visualizeDetectionCorners(detection) {
        const corners = detection.corners;
        if (!corners) return;
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        corners.forEach((corner, index) => {
            this.ctx.fillText(index, corner.x, corner.y);
        });
    }

    visualizeDetectionId(detection) {
        const { x, y } = detection.center;
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(detection.id , x, y);
    }

    displayWebcamVideo() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }

    getGrayscaleFrame() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const imageDataPixels = imageData.data;
        const grayscalePixels = new Uint8Array(this.canvas.width * this.canvas.height);
        for (let i = 0, j = 0; i < imageDataPixels.length; i += 4, j++) {
            const grayscale = Math.round((imageDataPixels[i] + imageDataPixels[i + 1] + imageDataPixels[i + 2]) / 3);
            grayscalePixels[j] = grayscale;
        }
        return grayscalePixels;
    }
}
