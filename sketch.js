/*
reference: https://www.youtube.com/watch?v=exrH7tvt3f4
*/

//Current Status: Press 0, 1, 2will show three different results
//0 is the original tutorial example
//1 and 2 is what I created

let c; // c foe canvas

let video;  // webcam input
let model;  // Face Landmarks machine-learning model
let face;   // detected face

let face_placement; //place video on the base

let firstFace = true;

let font;

let cameraPic;

let iconsReference=[];//this is the original png used

let icons=[];//this is the object exist in code

let options=[];

let currentOption = 0;

let cameraPosX = 40;
let cameraPosY = 100;

let cameraDistance;

let takingSnapshot = false;

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
     icons[i] = new Icon (iconsReference[i],600,100+i*60,50,50,false);
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

    if (key == "0"){
      //copy(video,0,0,width,height,0,0,width,height) // if I don't have this, the video with stuck when I switch from key==2

       // what I can draw on the face
       // show all the points
       //start from here, until copy(), is just function test, if want to see them need to comment out copy layer
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
     }

     if(icons[0].tag == true){
          //copy(video,0,0,width,height,0,0,width,height) // if I don't have this, the video with stuck when I switch from key==2

          let faceOutline = [];//start extract the shape

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);// extract the shape

          image(video, 320, 240, width,height);
          image(face_placement,320,240); 
          video.mask(face_placement);
          //I found the way to fill shape with image here:
          //https://stackoverflow.com/questions/60179313/how-to-fill-p5-js-shape-with-an-image
          image(video,random(220,420),240);//middle

          image(video,random(120,220),240);

          image(video,random(420,520),240);

          let exceptFace;

          
          ( exceptFace = video.get() ).mask(face_placement.get() );
          // I find the way to inverse graphics here: 
          //https://stackoverflow.com/questions/71059989/efficiently-mask-shapes-using-creategraphics-in-p5-js
          image(exceptFace,320,240);//fine this actually doesn't work, this is only the face

          //console.log(facePosX);

         
       }

    if(icons[1].tag == true){
          let faceOutline = [];//start extract the shape

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);// extract the shape

          let exceptFace;

          ( exceptFace = video.get() ).mask(face_placement.get() );
          // I find the way to inverse graphics here: 
          //https://stackoverflow.com/questions/71059989/efficiently-mask-shapes-using-creategraphics-in-p5-js
          //image(exceptFace,320,240);
          for (let pt of face.scaledMesh) {
            pt = scalePoint(pt);
            let w = random(75,125);
            image(exceptFace,pt.x,pt.y,w,0.75*w);
          }
    }

    if(icons[2].tag == true){
      let faceOutline = [];//start extract the shape

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);// extract the shape

          
          ( exceptFace = video.get() ).mask(face_placement.get() );
          // I find the way to inverse graphics here: 
          //https://stackoverflow.com/questions/71059989/efficiently-mask-shapes-using-creategraphics-in-p5-js
          //face_placement.drawingContext.globalCompositeOperation = 'source-in';
          //face_placement.image(exceptFace, 0, 0)

          let middle = scalePoint(face.scaledMesh[5]);//5 is the number of the map
          for(i=-0.5;i<2;i+=0.1){
            image(exceptFace,middle.x,middle.y,exceptFace.width/i,exceptFace.height/i);
          }
       }

      if(icons[3].tag == true){
         let faceOutline = [];//start extract the shape

          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            faceOutline.push(pt);
          }

          face_placement.fill(0);
          face_placement.beginShape();
          for (let pt of faceOutline) {
            vertex(pt.x, pt.y);
          }
          face_placement.endShape(CLOSE);// extract the shape

          let exceptFace;

          ( exceptFace = video.get() ).mask(face_placement.get() );
          // I find the way to inverse graphics here: 
          //https://stackoverflow.com/questions/71059989/efficiently-mask-shapes-using-creategraphics-in-p5-js
          //image(exceptFace,320,240);
          for (let pt of face.annotations.silhouette) {
            pt = scalePoint(pt);
            image(exceptFace,pt.x,pt.y,120,90);
          }

      }
   }


  myString01.display();
  myString01.move();

  myString02.display();
  myString02.move();

  myString03.display();
  myString03.move();

  myString04.display();
  myString04.move();

  for(let i=0;i<4;i++){
      icons[i].display();
   }

  image(cameraPic,cameraPosX,cameraPosY,50,50);

  cameraDistance = dist(mouseX, mouseY, cameraPosX, cameraPosY);

  if(cameraDistance<25){
   takingSnapshot = true;
  } else {
   takingSnapshot = false;
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

function mousePressed(){
   for(let i=0; i<4; i++){
      icons[i].clicked();
   }

   if (takingSnapshot == true){
   saveCanvas(c,'snapshot', 'jpg');
  }

}

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
      this.x = 650;
    }
  }


}

class Icon{
   constructor(name,x,y,w,h,tag){
      this.name = name;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.tag = tag;
   }

   display(){
      image(this.name,this.x,this.y,this.w,this.h);
   }

   clicked(){// I find the way to click on specific objects here: https://www.youtube.com/watch?v=DEHsr4XicN8

      let d = dist(mouseX, mouseY, this.x, this.y);
      
      if (d < 25){
          this.tag = true;// turn on the function

      }

      if (d > 25){
         if(takingSnapshot == true){
         }// do nothing, keep the function, prevent function stop when taking picture
         if(takingSnapshot == false){
            this.tag = false;// turn off the function when click any empty space on the screen
         }
      }

   }
}

