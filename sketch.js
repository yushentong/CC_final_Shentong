/*
reference: https://www.youtube.com/watch?v=exrH7tvt3f4
*/

let video;  // webcam input
let model;  // Face Landmarks machine-learning model
let face;   // detected face


let firstFace = true;


function setup() {
  createCanvas(640,480);
  pixelDensity(1);

  video = createCapture(VIDEO);
  //console.log(video.width);
  //console.log(video.height);
  //video.hide();
  
  // we need to make sure everything is loaded first
  while(!tf.ready()) {
  }
  // to load the model in an asynchronous function
  loadFaceModel();
}

// load the Face Landmarks model 
async function loadFaceModel() {
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    
    // limit results to just one face
    { maxFaces: 1 }
  );
}

function draw() {

  // get face data if the video and model are both loaded
  if (video.loadedmetadata && model !== undefined) {
    getFace();
  }

  // if we have face data, show us!
  if (face !== undefined) {
    image(video, 0,0, width,height);

    // print info the first time a face is detected
    if (firstFace) {
      console.log(face);
      firstFace = false;
    }

    video.loadPixels();
    loadPixels();

    for (let y=0;y<height;y++){
      for (let x=0;x<width;x++){
        let index = (width - x + 1 + y*width)*4;
        let r = video.pixels[index+0];
        let g = video.pixels[index+1];
        let b = video.pixels[index+2];
              
        pixels[index+0]=r;
        pixels[index+1]=15;
        pixels[index+2]=b;
        pixels[index+3]=255;
      }
    }

    updatePixels();

    // what I can draw on the face
    // show all the points
    fill(255);
    noStroke();
    for (let pt of face.scaledMesh) {
      pt = scalePoint(pt);
      circle(pt.x, pt.y, 3);
    }

    // show silhouette
    fill(0,150,255, 100);
    noStroke();
    beginShape();
    for (pt of face.annotations.silhouette) {
      pt = scalePoint(pt);
      vertex(pt.x, pt.y); // how to fill silhouette
    }
    endShape(CLOSE);

    // eyes
    // first, let's use the iris position as the center
    let leftEye =  scalePoint(face.annotations.leftEyeIris[0]);
    let rightEye = scalePoint(face.annotations.rightEyeIris[0]);

    // then use the face's overall bounding box to scale them
    //determine the size of the circle
    let topLeft =     scalePoint(face.boundingBox.topLeft);
    let bottomRight = scalePoint(face.boundingBox.bottomRight);
    let w = bottomRight.x - topLeft.x;
    let h = bottomRight.y - topLeft.y;
    let dia = w / 6;

    fill(255,100);
    noStroke();
    circle(leftEye.x,  leftEye.y,  dia);
    circle(rightEye.x, rightEye.y, dia);

    // the mouth is split into four parts: the top/bottom
    // and their inner/outer lips – to use these to make a 
    // shape, we have to be a little creative
    let mouth = [];
    for (let pt of face.annotations.lipsUpperInner) {
      pt = scalePoint(pt);
      mouth.push(pt);
    }
    for (let pt of face.annotations.lipsLowerInner) {
      pt = scalePoint(pt);
      mouth.push(pt);
    }

    fill(50,0,0);//fill a color into the mouth part
    noStroke();
    beginShape();
    for (let pt of mouth) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    // if necessary, you can also grab points directly
    // from the mesh! (see the url at the top for an
    // image showing all the point locations)
    let nose = scalePoint(face.scaledMesh[5]);//5 is the number of the map
    for (let d=w/6; d>=2; d-=1) {// d is alpha value associated with diameter of circle
      fill(255,150,0, map(d, w/6,2, 0,255));
      noStroke();
      circle(nose.x, nose.y, d);
    }

    //try to extract the color of the face

    if((pt.x)>width/2){
        fill(255,0,0,100);
      }else fill(0,255,0,100);
      //console.log(pt.x);
    beginShape();
    for (pt of face.annotations.silhouette) {
      pt = scalePoint(pt);
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    /*//beginShape();
    for (pt of face.annotations.silhouette) {
      //pt = scalePoint(pt);
      //vertex(pt.x, pt.y); // how to fill silhouette
      for (let y=0;y<w;y++){
            for (let x=0;x<h;x++){
              let index = (x + y*width)*4;
              let r = video.pixels[index+0];
              let g = video.pixels[index+1];
              let b = video.pixels[index+2];
              
              pixels[index]=r;
              pixels[index+1]=g;
              pixels[index+2]=b;
              pixels[index+3]=255;
            }
          }
    }
    //endShape(CLOSE);

    /*
    beginShape();
    for (pt of face.annotations.silhouette) {
          for (let y=0;y<w;y++){
            for (let x=0;x<h;x++){
              let index = (x + y*width)*4;
              pixels[index]=255;
              pixels[index+1]=0;
              pixels[index+2]=255;
              pixels[index+3]=255;
            }
          }
      pt = scalePoint(pt);
      vertex(pt.x, pt.y); // how to fill silhouette
    }
    endShape(CLOSE);
    //*/
  }

}


// converts points from video coordinates to canvas
function scalePoint(pt) {
  let x = map(pt[0], 0,video.width,0, width);
  let y = map(pt[1], 0,video.height, 0,height);
  return createVector(x, y);
}


// gets face points from video input
async function getFace() {
  const predictions = await model.estimateFaces({
    input: document.querySelector('video')
  }); 
  if (predictions.length === 0) {
    face = undefined;
  }
  else {
    face = predictions[0];
  }
}

