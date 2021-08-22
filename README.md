# 3D Models and Textures

This project is the source code for Assignment 2 of Advanced Graphics for Games.

## Project Structure

All object and texture assets provided are located in `Assets/`

All helper code provided is located in `Common/`, this code was not written by me.

`index.js` is where the main code is. It includes the initial WebGL setup code, and the code to render the shapes.

`objectParser.js` includes the parser code for both the texture files and obj files. Some ideas regarding the implementation of the parsers were borrowed from code provided to us, though the code has been refactored into a more modern state.

## Index
`index.js` contains 2 functions.

### Main
The main function is an anonymous function called when the window is first loaded via `window.onload`. It handles the main initialisation of the webgl context, shapes and program. It takes no parameters and returns nothing.

### Render
The render funcion is the function that renders all shapes from the array.  
It takes:  
`Array - shapes`
`WebGLUniformLocation - worldMatrixLocation`  
`WebGLProgram - program`  
and returns nothing.


## Object Parser
`objectParser.js` contains 3 functions. 

### parseObject
The main function `parseObject` is called when the user wants to instantiate a new object.  
This function takes:
`WebGLRenderingContext - gl`  
`String - type`  
`String - objFile`  
`String - textureFile`  
`Array - scale`  
`Array - pos`
`Number - rot`  
and returns:  
`Object`

### setupObject
The `setupObject` function is called by `parseObject` once the raw object data has been retrieved. It handles setting up the initial object with the vertices.  
It takes:
`Array - data`  
and returns:  
`Object`

### setupTexture
Similarly, the `setupTexture` function is also called by `parseObject` once the data has been retrieved. It handles the creation of the texture for the object.  
It takes:  
`WebGLRenderingContext - gl`  
`Array - data`  
and returns:  
`WebGLTexture`