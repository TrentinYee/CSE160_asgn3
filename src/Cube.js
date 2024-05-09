class Cube{
    constructor(){
      this.type='cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum=0;
    }
  
    render() {
      var rgba = this.color;

      // pass the texture number
      
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // pass the point color
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // just the front of the cube
      drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
      drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0,], [0,0, 0,1, 1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

      // back side
      drawTriangle3DUV( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0,], [0,0, 1,1, 1,0]);
      drawTriangle3DUV( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0,], [0,0, 0,1, 1,1]);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
      // top side
      drawTriangle3DUV( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,], [0,0, 1,0, 1,1]);
      drawTriangle3DUV( [0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0,], [0,0, 1,1, 0,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

      // bottom side
      drawTriangle3DUV( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,], [0,0, 1,0, 1,1]);
      drawTriangle3DUV( [0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0,], [0,0, 1,1, 0,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

      // left side
      drawTriangle3DUV( [0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,0.0,1.0,], [0,0, 1,1, 1,0]);
      drawTriangle3DUV( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0,], [0,0, 0,1, 1,1]);

      // right side
      drawTriangle3DUV( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0,], [0,0, 1,1, 1,0]);
      drawTriangle3DUV( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,], [0,0, 0,1, 1,1]);

    }

    renderfast() {
      var rgba = this.color;
      var allverts = [];
      var alluvs = [];

      //Pass the color of a point to u_FragColor variable
      //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // just the front of the cube
      allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
      alluvs = alluvs.concat( [0,0, 1,1, 1,0]);
      allverts = allverts.concat( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0,]);
      alluvs = alluvs.concat( [0,0, 0,1, 1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

      // back side
      allverts = allverts.concat( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,1, 1,0]);
      allverts = allverts.concat( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 0,1, 1,1]);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
      // top side
      allverts = allverts.concat( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,0, 1,1]);
      allverts = allverts.concat( [0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,1, 0,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

      // bottom side
      allverts = allverts.concat( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,0, 1,1]);
      allverts = allverts.concat( [0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,1, 0,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

      // left side
      allverts = allverts.concat( [0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,0.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,1, 1,0]);
      allverts = allverts.concat( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 0,1, 1,1]);

      // right side
      allverts = allverts.concat( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0,]);
      alluvs = alluvs.concat( [0,0, 1,1, 1,0]);
      allverts = allverts.concat( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,]);
      alluvs = alluvs.concat( [1,0, 0,1, 1,1]);

      drawTriangle3DUV(allverts, alluvs);
    }
  }

  function drawCube(pos, scale, irot, rot, color) {
    var body = new Cube();
    body.color = color;
    body.matrix.translate(pos[0],pos[1],pos[2]);
    body.matrix.rotate(irot[0], irot[1], irot[2], irot[3]);
    body.matrix.rotate(rot[0], rot[1], rot[2], rot[3]);
    var matrixStore = new Matrix4(body.matrix);
    body.matrix.scale(scale[0],scale[1],scale[2]);
    body.render();

    return matrixStore;
  }

