let projection;

function setup() {
  createCanvas(800, 600);
  projection = new ProjectionSystem();
}

function draw() {
  background(8, 12, 35);

  drawStars();
  drawIdol(projection.markedCount === 5);
  projection.display();

  // Project progress
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(15);
  text(
    "PROJECTIONS: " + projection.markedCount + " / 5",
    width / 2,
    30
  );

  if (projection.markedCount === 5) {
    fill(255, 190, 220);
    textSize(20);
    text("Perhaps half of you was always me.", width / 2, 570);
  }
}

// ------------------------------
// Background
// ------------------------------

function drawStars() {
  randomSeed(10);

  noStroke();

  for (let i = 0; i < 90; i++) {
    fill(255, random(80, 220));
    circle(random(width), random(height), random(1, 3));
  }
}

// ------------------------------
// Idol
// ------------------------------

function drawIdol(isComplete) {
  push();

  // Blue idol's body
  noStroke();
  fill(65, 105, 190);

  // Head
  ellipse(400, 105, 105, 125);

  // Neck
  rect(375, 155, 50, 45);

  // Body
  rect(325, 185, 150, 230, 65);

  // Arms
  stroke(65, 105, 190);
  strokeWeight(35);
  line(340, 220, 275, 390);
  line(460, 220, 525, 390);

  // Legs
  noStroke();
  rect(340, 385, 55, 150, 25);
  rect(405, 385, 55, 150, 25);

  // Face details
  fill(220, 230, 255);
  ellipse(380, 105, 9, 9);
  ellipse(420, 105, 9, 9);

  stroke(220, 230, 255);
  strokeWeight(3);
  noFill();
  arc(400, 125, 30, 15, 0, PI);

  // After all projections, transform the left half
  if (isComplete) {
    drawingContext.save();

    // Clip all following drawings to the left half
    drawingContext.beginPath();
    drawingContext.rect(250, 0, 150, height);
    drawingContext.clip();

    noStroke();
    fill(255, 145, 190);

    // Pink character's head
    ellipse(400, 105, 105, 125);

    // Pink character's neck and body
    rect(375, 155, 50, 45);
    rect(325, 185, 150, 230, 65);

    // Pink character's left arm
    stroke(255, 145, 190);
    strokeWeight(35);
    line(340, 220, 275, 390);

    // Pink character's left leg
    noStroke();
    rect(340, 385, 55, 150, 25);

    // Pink character's face
    fill(255, 225, 235);
    ellipse(380, 105, 9, 9);

    drawingContext.restore();

    // Clear dividing line
    stroke(255, 210, 230);
    strokeWeight(2);
    line(400, 40, 400, 535);
  }

  pop();
}

// ------------------------------
// Projection System
// ------------------------------

class ProjectionSystem {
  constructor() {
    // Light source
    this.lightX = 100;
    this.lightY = 520;
    this.dragging = false;

    // Projected shadow
    this.shadowX = 350;
    this.shadowY = 100;

    // Five projection targets on the left half of the idol
    this.targets = [
      { x: 350, y: 105, marked: false, color: [255, 100, 160] },
      { x: 335, y: 220, marked: false, color: [255, 190, 80] },
      { x: 365, y: 300, marked: false, color: [160, 120, 255] },
      { x: 335, y: 380, marked: false, color: [100, 210, 255] },
      { x: 365, y: 480, marked: false, color: [255, 120, 100] }
    ];

    this.activeTarget = -1;
    this.markedCount = 0;
  }

  // Map light position to shadow position
  updateShadow() {
    this.shadowX = map(
      this.lightX,
      50,
      750,
      270,
      395
    );

    this.shadowY = map(
      this.lightY,
      450,
      580,
      75,
      510
    );

    this.shadowX = constrain(this.shadowX, 270, 395);
    this.shadowY = constrain(this.shadowY, 75, 510);

    // Check whether the shadow overlaps a target
    this.activeTarget = -1;

    for (let i = 0; i < this.targets.length; i++) {
      let target = this.targets[i];

      if (!target.marked) {
        let d = dist(
          this.shadowX,
          this.shadowY,
          target.x,
          target.y
        );

        if (d < 30) {
          this.activeTarget = i;
          break;
        }
      }
    }
  }

  // Display all projection elements
  display() {
    this.updateShadow();

    // Draw projection targets
    for (let i = 0; i < this.targets.length; i++) {
      let target = this.targets[i];

      if (target.marked) {
        // Permanent colored projection mark
        noStroke();
        fill(
          target.color[0],
          target.color[1],
          target.color[2],
          220
        );
        circle(target.x, target.y, 25);

      } else {
        // Uncompleted target
        noFill();

        if (i === this.activeTarget) {
          stroke(255, 220, 240);
          strokeWeight(4);
        } else {
          stroke(180, 200, 255, 130);
          strokeWeight(2);
        }

        circle(target.x, target.y, 28);
      }
    }

    // Draw shadow
    noStroke();
    fill(255, 140, 190, 110);
    ellipse(this.shadowX, this.shadowY, 45, 65);

    // Draw light beam
    stroke(255, 220, 240, 45);
    strokeWeight(2);
    line(
      this.lightX,
      this.lightY,
      this.shadowX,
      this.shadowY
    );

    // Draw light source
    noStroke();
    fill(255, 240, 190, 80);
    circle(this.lightX, this.lightY, 55);

    fill(255, 240, 200);
    circle(this.lightX, this.lightY, 20);

    // Instruction
    fill(255, 220);
    textAlign(CENTER);
    textSize(12);
    text(
      "DRAG THE LIGHT · CLICK TO PROJECT",
      width / 2,
      height - 15
    );
  }

  // Start dragging the light
  handlePress() {
    let d = dist(
      mouseX,
      mouseY,
      this.lightX,
      this.lightY
    );

    if (d < 35) {
      this.dragging = true;
    } else {
      // Click on a target to leave a permanent mark
      this.updateShadow();

      if (this.activeTarget !== -1) {
        this.targets[this.activeTarget].marked = true;
        this.markedCount++;
      }
    }
  }

  // Move the light with the mouse
  handleDrag() {
    if (this.dragging) {
      this.lightX = constrain(mouseX, 50, 750);
      this.lightY = constrain(mouseY, 450, 580);
      this.updateShadow();
    }
  }

  // Stop dragging
  handleRelease() {
    this.dragging = false;
  }
}

// ------------------------------
// Mouse interaction
// ------------------------------

function mousePressed() {
  projection.handlePress();
}

function mouseDragged() {
  projection.handleDrag();
}

function mouseReleased() {
  projection.handleRelease();
}