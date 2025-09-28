Crowd Simulator using WebGL
This project is a web-based crowd simulator that uses WebGL and 2D Canvas to visualize spatial partitioning. The simulation renders a dynamic triangulation of a 2D space containing an interactive obstacle and a crowd of people, represented as black points. The color of each triangle changes based on its population density.
Features
Dynamic Triangulation: The 2D space is partitioned into triangles using the Delaunator library. The mesh is automatically and instantly rebuilt when the layout changes.
Interactive Obstacle: Users can move, rotate, and scale a central obstacle using mouse and keyboard controls.
Interactive People: Individual "people" (dots) can be dragged and dropped from one triangle to another.
Population Density Visualization: Triangles are colored green (optimal density), red (overpopulated), or blue (underpopulated) based on the number of people they contain.
Modular Codebase: The JavaScript is structured into ES6 modules for better organization and maintainability, separating concerns like rendering, simulation logic, and UI control.
Prerequisites
You will need a modern web browser that supports WebGL and ES6 modules (e.g., Chrome, Firefox, Safari, Edge).
Installation and Setup
Because this project uses ES6 modules (import/export), it must be run from a local web server to avoid browser security restrictions (CORS errors). You cannot simply open the index.html file directly from your file system.
Here is the recommended way to run the application:
Download the Project: Ensure you have all the project files in a single folder with the following structure: crowd-simulator/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── main.js
    ├── config.js
    ├── renderer.js
    ├── shaders.js
    ├── simulation.js
    └── utils.js


Start a Local Web Server: Open your terminal or command prompt, navigate into the main crowd-simulator/directory, and run one of the following commands:
If you have Python 3: python -m http.server


If you have Python 2: python -m SimpleHTTPServer


If you have Node.js and serve installed (npm install -g serve): serve .


Open the Application: Once the server is running, open your web browser and navigate to the following address:http://localhost:8000
The crowd simulator application should now be running.
Usage and Controls
Move Obstacle: Click and drag the central grey obstacle.
Rotate Obstacle: Hold down Shift while clicking and dragging the obstacle.
Scale Obstacle: Use the mouse wheel while hovering over the obstacle.
Move a Person: Click and drag any of the black dots.
Keyboard Controls:
R: Rotate the obstacle by 15 degrees.
+ / -: Scale the obstacle up or down.
C: Toggle the visibility of the triangle edges.
UI Buttons:
Regenerate: Creates a new random layout of points and people.
Retriangulate: Manually forces the mesh to be rebuilt.
Center Obstacle: Resets the obstacle to the center of the canvas.
Show points: Toggles the visibility of the triangulation vertices.
