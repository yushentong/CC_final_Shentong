//Instructions: 
//This project can only run locally, not able to run on OpenProcessing because of tensorflow.js in use.
//Need to run a web server because of font and images in use.

//The four icons on the right present four different effects if pressed.
//The camera icon will take a snapshot and save it on your device if pressed.

//HAVE FUN :)))))

let c; // c for canvas, for snapshot

let video;  // webcam input
let model;  // Face Landmarks machine-learning model
let face;   // detected face

let face_placement; //place video on the base

let firstFace = true;

let font;

let cameraPic;//camera icon Pic

let iconsReference=[];//this is the original png used

let icons=[];//this is the object exist in code

let cameraPosX = 40;//make two seperate value in case I want to change the camera position
let cameraPosY = 100;

let cameraDistance;

let takingSnapshot = false;

let flashScreen = false;

function preload() {
  font = loadFont('data/EduMonumentGrotesk-Ultra.otf');

  for(let i=0;i<4;i++){
      iconsReference[i] = loadImage('data/icon'+(i+1)+'.png');
   }

  cameraPic = loadImage('data/camera.png');
}


function setup() {
  imageMode(CENTER);
  ellipseMode(CENTER);
  c = createCanvas(640,480);
  //pixelDensity(1);

  video = createCapture(VIDEO);
  //console.log(video.width);
  //console.log(video.height);
  video.hide();
  
  // I learned how to use face detection here:
  //https://www.youtube.com/watch?v=exrH7tvt3f4
  // we need to make sure everything is loaded first
  while(!tf.ready()) {
  }
  // to load the model in an asynchronous function
  loadFaceModel();

  face_placement = createGraphics(640,480);

  myString01 = new RollingText('Who am I?   What is reality?   What is fantasy?',50,40,-950);
  myString02 = new RollingText('Who am I?   What is reality?   What is fantasy?',850,40,-950);
  myString03 = new RollingText('Watching me being me alienates me from me.',50,440,-950);
  myString04 = new RollingText('Watching me being me alienates me from me.',850,440,-950);

  for(let i=0;i<4;i++){
     icons[i] = new Icon (iconsReference[i],600,190+i*60,50,50,false);
  }

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

    copy(video,0,0,width,height,0,0,width,height)

    /*


    video.loadPixels();// load pixels to test
    loadPixels();

    for (let y=0;y<height;y++){
      for (let x=0;x<width;x++){
        let index = (x + y*width)*4;
        let r = video.pixels[index+0];
        let g = video.pixels[index+1];
        let b = video.pixels[index+2];
              
        pixels[index+0]=r;
        pixels[index+1]=g;
        pixels[index+2]=b;
        pixels[index+3]=255;
      }
    }

    updatePixels();
    */

     if(icons[0].tag == true){//effect 1

          let faceOutline = [];//start extract the shape

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }// select all the points inside silhouette

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);// use the select points to create graphics
          }
          face_placement.endShape(CLOSE);//end extract the shape, this is the shape not the image inside

          image(video, 320, 240, width,height);//first way to extract image (face) inside
          image(face_placement,320,240); 
          video.mask(face_placement);
          //I found the way to fill shape with image here:
          //https://stackoverflow.com/questions/60179313/how-to-fill-p5-js-shape-with-an-image
          image(video,random(220,420),240);//middle

          image(video,random(120,220),240);

          image(video,random(420,520),240);

          let exceptFace;// the second way, I originally I want to do inverse select but looks like it doesn't work
          
          ( exceptFace = video.get() ).mask(face_placement.get() );
          // I find the way to inverse graphics here: (not success) 
          //https://stackoverflow.com/questions/71059989/efficiently-mask-shapes-using-creategraphics-in-p5-js
          image(exceptFace,320,240);//fine this actually doesn't work, this is only the face

         
       }

    if(icons[1].tag == true){//effect 2
          let faceOutline = [];

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);

          let exceptFace;

          ( exceptFace = video.get() ).mask(face_placement.get() );

          for (let pt of face.scaledMesh) {//place face inside the face
            pt = scalePoint(pt);
            let w = random(75,125);
            image(exceptFace,pt.x,pt.y,w,0.75*w);
          }
    }

    if(icons[2].tag == true){//effect 3
      let faceOutline = [];

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);

          
          ( exceptFace = video.get() ).mask(face_placement.get() );
          
          let middle = scalePoint(face.scaledMesh[5]);//5 is the number from the library map
          for(i=-0.5;i<2;i+=0.1){//scaled the face extracted
            image(exceptFace,middle.x,middle.y,exceptFace.width/i,exceptFace.height/i);//place on the middle of the face
          }
       }

      if(icons[3].tag == true){//effect 4
         let faceOutline = [];

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);

          let exceptFace;

          ( exceptFace = video.get() ).mask(face_placement.get() );
          
          for (let pt of face.annotations.silhouette) {//place face on the silhouette
            pt = scalePoint(pt);
            image(exceptFace,pt.x,pt.y,100,75);
          }

      }
   }

   //display the text on top and buttom

  myString01.display();
  myString01.move();

  myString02.display();
  myString02.move();

  myString03.display();
  myString03.move();

  myString04.display();
  myString04.move();

  //display four icons on the right

  for(let i=0;i<4;i++){
      icons[i].display();
   }

   //display the camera icon

  image(cameraPic,cameraPosX,cameraPosY,50,50);

  //define cameraDistance, determine whether takingSnapshot Boolean is true/false

  cameraDistance = dist(mouseX, mouseY, cameraPosX, cameraPosY);

  if(cameraDistance<25){
   takingSnapshot = true;
  } else {
   takingSnapshot = false;
  }

  if(flashScreen == true && takingSnapshot == true){//flash when press camera
   fill(255);
   rect(0,0,width,height);
   flashScreen = false;
  }

  //console.log(takingSnapshot);
  //console.log(cameraDistance);

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

//when mouse click on something, what function to play

function mousePressed(){
   //four effects
   for(let i=0; i<4; i++){
      icons[i].clicked();
   }

   //snapshot
   if (takingSnapshot == true){
   saveCanvas(c,'snapshot', 'jpg');
   flashScreen = true;
   }



}

//text class

class RollingText{
   constructor(c,x,y,n){
      this.c = c;//c is the content
      this.x = x;//beginning x of text
      this.y = y;//y of text
      this.n = n;//n is the limitation of when to go back
   }

   display(){
   fill(0,255,0);
    noStroke();
    textFont(font, 32);
    text(this.c,this.x,this.y);

   }

   move(){
    this.x = this.x - 5;//5 is the moving speed

    if(this.x < this.n){
      this.x = 650;//650 is the intial x after the text goes back
    }
  }


}

class Icon{
   constructor(name,x,y,w,h,tag){
      this.name = name;//name of the image
      this.x = x;//x of icon
      this.y = y;//y of icon
      this.w = w;//w of icon
      this.h = h;//h of icon
      this.tag = tag;//tag determines whether a function should be in use or not
   }

   display(){
      image(this.name,this.x,this.y,this.w,this.h);
   }

   clicked(){// I find the way to click on specific objects here: https://www.youtube.com/watch?v=DEHsr4XicN8

      let d = dist(mouseX, mouseY, this.x, this.y);//know whether the user click on the icon
      
      if (d < 25){//if clicked
          this.tag = true;// turn on the function

      }

      if (d > 25){//if clicked not on the icons, but maybe on the camera
         if(takingSnapshot == true){//the user is clicking on the camera
         }// do nothing, keep the function, prevent function stop when taking snapshot
         if(takingSnapshot == false){//the user is clicking on any empty space on the screen
            this.tag = false;// turn off the function
         }
      }

   }
}

