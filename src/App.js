import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  // Main function
  const runCoco = async () => {
    // Explicitly set the backend to WebGL
    await tf.setBackend("webgl");

    const net = await cocossd.load();
    console.log("COCO-SSD model loaded.");

    // Wait for the video to load its metadata
    videoRef.current.addEventListener("loadedmetadata", () => {
      setIsVideoPaused(false); // Ensure video playback starts
    });

    // Loop and detect objects
    const detectObjects = async () => {
      if (webcamRef.current && videoRef.current) {
        const obj = await net.detect(webcamRef.current.video);
        console.log("Detected Objects:", obj);

        // Check for object detection and pause the video
        if (obj.some((item) => item.class === "cell phone")) {
          setIsVideoPaused(true);
          setPopupVisible(true);
          videoRef.current.pause();
        } else {
          setIsVideoPaused(false);
          setPopupVisible(false);
          videoRef.current.play();
        }
      }
      requestAnimationFrame(detectObjects);
    };

    detectObjects();
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <div className="App">
      <h3 className="Heading">Live Object Detector</h3>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
           // display: "none", // Hide the webcam container
          }}
        />

        <video
          ref={videoRef}
          width="640"
          height="360"
          controls
          autoPlay
          muted
          style={{
            display: isVideoPaused ? "none" : "block",
          }}
        >
          <source
            src="https://file-examples.com/storage/fe7fa6fa10650d95e925ca2/2017/04/file_example_MP4_640_3MG.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8,
            width: "fit-content",
            height: "auto",
          }}
        />

        {popupVisible && (
          <div
            id="popup"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "20px",
              borderRadius: "10px",
              zIndex: 10,
            }}
          >
            <p>Video paused due to cell phone detected</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
