class Camera{
    constructor(){
      this.type='Camera';
      this.fov = 60;
      this.eye = new Vector3([0,2,3]);
      this.at = new Vector3([0,0,-100]);
      this.up = new Vector3([0,1,0]);
      this.viewMat = new Matrix4();
      this.viewMat.setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
      );
      this.projMat = new Matrix4();
      this.projMat.setPerspective(this.fov, canvas.width/canvas.height, .1, 1000);
    }

    moveForward(speed) {
        // finds distance between eye and at
        var f = new Vector3();
        f = f.set(this.at);
        f.sub(this.eye);
        f.normalize(this.f);
        f.mul(speed);
        
        this.eye.add(f);
        this.at.add(f);

        this.viewMat.setLookAt(
          this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
          this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        
    }

    moveBackward(speed) {
      // finds distance between eye and at
      var b = new Vector3();
      b = b.set(this.at);
      b.sub(this.eye);
      b.normalize(this.b);
      b.mul(speed);
      
      this.eye.sub(b);
      this.at.sub(b);

      this.viewMat.setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
      );
      
  }

  moveLeft(speed) {
    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    f.mul(speed);

    let l = Vector3.cross(f, this.up);
    
    this.eye.sub(l);
    this.at.sub(l);

    
    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
    
  }

  moveRight(speed) {
    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    f.mul(speed);

    let r = Vector3.cross(f, this.up);
    
    this.eye.add(r);
    this.at.add(r);

    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );

  }

  panLeft(alpha) {

    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    //console.log(f.elements);

    var rotationMatrix = new Matrix4();
    //var r = Math.sqrt(Math.pow((f.dot()), 2) + Math.pow((f.dot(y)), 2))
    rotationMatrix = rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye)
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  panRight(alpha) {

    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    //console.log(f.elements);

    var rotationMatrix = new Matrix4();
    //var r = Math.sqrt(Math.pow((f.dot()), 2) + Math.pow((f.dot(y)), 2))
    rotationMatrix = rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye)
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  panUp(alpha) {

    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    //console.log(f.elements);

    let upRotate = Vector3.cross(f, this.up).elements;

    // would not have remembered this formula if not for jwdickers's blocky world
    // it finds the angle between the up and front
    let THETA = ((Math.acos(Vector3.dot(f, this.up) / (this.up.magnitude() * f.magnitude()))) * 180) / Math.PI;

    //reduces alpha to an amount that will not go over
    if (0.001 > (THETA - alpha)) {
      alpha = 0;
    }
    console.log(THETA+alpha);

    var rotationMatrix = new Matrix4();
    //var r = Math.sqrt(Math.pow((f.dot()), 2) + Math.pow((f.dot(y)), 2))
    rotationMatrix = rotationMatrix.setRotate(alpha, upRotate[0], upRotate[1], upRotate[2]);
    var f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye)
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  panDown(alpha) {

    // finds distance between eye and at
    var f = new Vector3();
    f = f.set(this.at);
    f.sub(this.eye);
    f.normalize(this.f);
    //console.log(f.elements);

    let upRotate = Vector3.cross(f, this.up).elements;

    // would not have remembered this formula if not for jwdickers's blocky world
    // it finds the angle between the up and front
    let THETA = ((Math.acos(Vector3.dot(f, this.up) / (this.up.magnitude() * f.magnitude()))) * 180) / Math.PI;

    //reduces alpha to an amount that will not go over
    if (180 - 0.001 < (THETA + alpha)) {
      alpha = 0;
    }

    console.log(THETA - alpha);

    var rotationMatrix = new Matrix4();
    //var r = Math.sqrt(Math.pow((f.dot()), 2) + Math.pow((f.dot(y)), 2))
    rotationMatrix = rotationMatrix.setRotate(-alpha, upRotate[0], upRotate[1], upRotate[2]);
    var f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye)
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }


}

