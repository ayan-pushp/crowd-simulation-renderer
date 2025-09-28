# Interactive Crowd Simulator using WebGL


This project is a web-based crowd simulator that uses WebGL and 2D Canvas to visualize spatial partitioning. The simulation renders a dynamic triangulation of a 2D space containing an interactive obstacle and a crowd of people, represented as black points, whose density is visualized with color-coded triangles. The application is built with modern HTML5, CSS3, and JavaScript (ES6 Modules).


## Features

* **Interactive Obstacle:** Users can move, rotate, and scale the central obstacle using mouse and keyboard controls.
* **Dynamic Re-triangulation:** The 2D space is partitioned into triangles using the Delaunator library. The mesh is automatically and instantly rebuilt in real-time whenever the obstacle is manipulated or when the layout changes.
* **Population Density Visualization:** Triangles are colored red (overpopulated), green (optimal density), or blue (underpopulated) based on the number of "people" they contain.
* **Interactive Crowd:** Individual people (represented by black dots) can be dragged and dropped from one triangle to another, with colors updating instantly.
* **Modern & Responsive UI:** The user interface is clean, centered, and designed to work well on various screen sizes.
* **Modular Codebase:** The JavaScript is structured into ES6 modules for better organization and maintainability, separating concerns like rendering, simulation logic, and UI control.

## How to Run the Application

**Instructions:**

1.  **Prerequisites:** Because this project uses ES6 modules (import/export), it must be run from a local web server to avoid browser security restrictions (CORS errors). You cannot simply open the index.html file directly from your file system.To run the application correctly, you must serve the files from a local web server. The easiest way to do this is with the **Live Server** extension in Visual Studio Code.
    * [Visual Studio Code](https://code.visualstudio.com/) installed.
    * The [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension installed from the VS Code Marketplace.
2.  **Open the Project:** Ensure you have all the project files in a single folder with the following structure:

```
     crowd-simulation-renderer/
    ├── index.html
    ├── styles.css
    └── js/
        ├── main.js
        ├── config.js
        ├── renderer.js
        ├── shaders.js
        ├── simulation.js
        └── utils.js
```
3.  **Start the Server:** In the bottom-right corner of the VS Code window, click the **"Go Live"** button.
    
4.  **View in Browser:** Your default web browser will automatically open with the application running, usually at an address like `http://127.0.0.1:5500`.

The application should now be running correctly.

## User Controls

### Mouse Controls:

* **Move Obstacle:** Click and drag the central obstacle.
* **Rotate Obstacle:** Hold down the `Shift` key while clicking and dragging the obstacle.
* **Scale Obstacle:** Use the mouse wheel while hovering over the simulation area.
* **Move a Person:** Click and drag any of the black dots.

### Keyboard Controls:

* **R Key:** Rotate the obstacle by 15 degrees.
* **+/- Keys:** Scale the obstacle up or down.

### UI Buttons:
* **Regenerate:** Creates a new random layout of points and people.
* **Center Obstacle:** Resets the obstacle to the center of the canvas.
* **Show points:** Toggles the visibility of the triangulation vertices.

