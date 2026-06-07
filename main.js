const indicator = document.getElementById('indicator');
const continueBtn = document.getElementById('continue');

continueBtn.onclick = e => {
    continueBtn.disabled = true;
    loadGestures();
};


const gestures = [
    "Victory",
    "Open_Palm",
    "Thumb_Up",
    "Thumb_Down",
    "Pointing_Up"
    // "ILoveYou",
]

const fontAwesomeTable = {
    "Victory": "fa-solid fa-hand-peace",
    "Open_Palm": "fa-solid fa-hand",
    "Closed_Fist": "fa-solid fa-hand-fist",
    "Thumb_Up": "fa-solid fa-thumbs-up",
    "Thumb_Down": "fa-solid fa-thumbs-down",
    "Pointing_Up": "fa-solid fa-hand-point-up"
    // "ILoveYou":
};

const numOfGestures = 4;
let index = 0;
let iconElements = [];
let gestureQueue = [];

function loadGestures() {
    iconElements.forEach(elm => {
        elm.remove();
    });
    iconElements = [];
    index = 0;
    gestureQueue = [ gestures[Math.floor(Math.random() * gestures.length)] ];

    
    while(gestureQueue.length < numOfGestures) {
        let str = gestures[Math.floor(Math.random() * gestures.length)];
        if (str != gestureQueue[gestureQueue.length-1])
            gestureQueue.push(str);
    }

    for(let i = 0; i < numOfGestures; i++) {
        let elm = document.createElement('i');
        indicator.appendChild(elm);
        iconElements.push(elm);
    }

    cycleIcons();
    console.log(gestureQueue)
}

loadGestures();


function cycleIcons() {
    for(let i = 0; i < iconElements.length; i++)
    {
        iconElements[i].classList = [];
        // console.log(fontAwesomeTable[gestures[i]])
        iconElements[i].classList.add(...fontAwesomeTable[gestureQueue[i]].split(' '));

        if (i === index)
            iconElements[i].classList.add('main');
        else if (i === index - 1)
            iconElements[i].classList.add('prev');
        else if (i < index - 1)
            iconElements[i].classList.add('passed');
        else if (i === index + 1)
            iconElements[i].classList.add('next-up');
        else if (i > index + 1)
            iconElements[i].classList.add('in-queue');
    }
}


// addEventListener('keydown', e => {
//     index++;
//     cycleIcons();
// });



import { GestureRecognizer, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const video = document.getElementById("webcam");

let gestureRecognizer;
let runningMode = "VIDEO";

// Initialize the Recognizer
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "gesture_recognizer.task",
            delegate: "CPU"
        },
        runningMode: runningMode,
        numHands: 2 // Hardcoded default
    });

    startWebcam();
};

// Access the Webcam
function startWebcam() {

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

// Prediction Loop
async function predictWebcam() {
    // Ensure canvas matches video dimensions
    // canvasElement.style.width = video.videoWidth + "px";
    // canvasElement.style.height = video.videoHeight + "px";
    // canvasElement.width = video.videoWidth;
    // canvasElement.height = video.videoHeight;

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);

    // Clear canvas
    // canvasCtx.save();
    // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // const drawingUtils = new DrawingUtils(canvasCtx);

    /* if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5
            });
            drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
        }
    } */

    // Display top gesture
    if (results.gestures.length > 0) {
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
        // const handedness = results.handedness[0][0].displayName;
        if (index < numOfGestures && categoryName == gestureQueue[index]) {
            index++;
            cycleIcons();
            if (index >= numOfGestures) {
                continueBtn.disabled = false;
            }
        }
        // gestureOutput.innerText = `Gesture: ${categoryName} (${handedness}) - ${categoryScore}%`;
    } else {
        // gestureOutput.innerText = "No Gesture Detected";
    }

    // canvasCtx.restore();

    // Call this function again to keep predicting
    window.requestAnimationFrame(predictWebcam);
}

createGestureRecognizer();