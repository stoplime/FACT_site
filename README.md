# FACT Chart Interactive Viewer

A web-based, interactive 3D viewer for Freedom and Constraint Topologies (FACT) charts, designed for studying compliant mechanisms. This project transforms the static, dense FACT chart into a dynamic and explorable educational tool.

## What is This?

The FACT chart is a systematic map of all possible motion capabilities (degrees of freedom, or DOF) of objects in 3D space. It's like a "Periodic Table" for motion, where each entry represents a unique type of freedom space and its corresponding constraint space.

This application solves the challenge of visualizing these complex 3D geometric shapes from a 2D image. It provides an interactive grid where users can click on any entry to open a 3D viewer, allowing them to inspect the Freedom and Constraint spaces from any angle.

## Original FACT Chart
![FACT Chart](images/FACT_chart.png)

## Features

-   **Interactive Grid:** A complete 50-slot layout of the FACT chart, built dynamically from a data source.
-   **3D Modal Viewer:** A popup viewer that displays the Freedom and Constraint space models side-by-side.
-   **Synchronized Camera Controls:** Rotating the camera for one model rotates the other in perfect sync, highlighting their dual relationship.
-   **Data-Driven:** The entire chart, including the 3D models for each entry, is defined in a single, easy-to-edit JSON file. No rendering code needs to be changed to add or modify chart entries.
-   **Procedural Geometry:** All 3D shapes are generated programmatically using a library of "elemental shapes," ensuring consistency and scalability.
-   **Side-by-Side Thumbnails:** Each cell in the chart dynamically renders a preview of both its Freedom and Constraint space for at-a-glance information.

## How to Run It

To run this project on your local machine, you will need Node.js and its package manager, npm.

### Prerequisites

-   **Node.js**: [Download and install Node.js here](https://nodejs.org/) (which includes npm).

### Installation & Launch

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/stoplime/FACT_site.git
    cd FACT_site
    ```

2.  **Install dependencies:**
    This command reads the `package.json` file and downloads all necessary libraries (like Three.js and Vite) into the `node_modules` folder.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This command starts the Vite development server, which will open the application in your web browser and automatically reload the page whenever you save a file.
    ```bash
    npm run dev
    ```

4.  **Open the URL:**
    The terminal will provide a local URL, typically `http://localhost:5173/`. Open this link in your browser to see the application.

## How It Works (Project Structure)

The project is built using vanilla JavaScript with the Vite build tool and the Three.js library for 3D rendering. The core logic is split into several modules:

-   `index.html`: The single HTML page that serves as the entry point for the application. It contains the main grid container and the hidden modal structure.
-   `src/main.js`: The main orchestrator. It loads the chart data, generates the thumbnails, builds the HTML grid, and sets up the click event listeners that open the modal.
-   `src/fact-data.json`: **The database for the chart.** This is the most important file for content creators. It contains an array of objects, where each object defines a single entry in the FACT chart, including the 3D shapes to render.
-   `src/elemental-shapes.js`: The "geometry library." This file contains all the functions (`createDisk`, `createSphere`, `createHyperboloid`, etc.) that procedurally generate the 3D models.
-   `src/modal-viewer.js`: Manages all logic for the interactive popup, including initializing the two 3D scenes, handling the synchronized camera, and showing/hiding the modal.
-   `src/thumbnail-renderer.js`: Manages the off-screen rendering process to generate the side-by-side preview images for each cell in the grid.
-   `src/scene-helpers.js`: Contains reusable functions for creating and populating 3D scenes, used by both the modal viewer and the thumbnail renderer to reduce code duplication.
-   `src/data-helpers.js`: Contains helper functions that bridge the gap between the simple data in the JSON file and the complex objects that Three.js requires (e.g., converting a `[x, y, z]` array into a `THREE.Vector3` object).
-   `src/chart-template.js`: Defines the static 50-slot layout of the chart, including the special positioning for the "ears" of the 3-DOF column.

## Populating the Chart (How to Add and Modify Shapes)

The most powerful feature of this application is that you can add or change the 3D models without touching any of the rendering code. **All changes are made in the `src/fact-data.json` file.**

### The Entry Object Structure

The `fact-data.json` file is an array of entry objects. Each object looks like this:

```json
{
  "id": "3-DOF-14",
  "dof": 3,
  "row": 14,
  "freedomSpace": { /* ... */ },
  "constraintSpace": { /* ... */ }
}
```

-   `id`: A unique identifier string, typically in the format `"DOF-ROW"`.
-   `dof`: The column the entry belongs in (a number from 0 to 6).
-   `row`: The row number within that column (a number from 1 to 22).
-   `freedomSpace` & `constraintSpace`: Objects that describe the models to be rendered.

### The Element Structure

Inside `freedomSpace` and `constraintSpace` is an `elements` array. This allows you to overlap multiple shapes to create complex models.

```json
"freedomSpace": {
  "elements": [
    {
      "type": "createHyperboloid",
      "options": {
        "color": "#ff0000",
        "height": 2.1,
        "twistAngle": 2.1
      },
      "position": [0, 0, 0.5],
      "rotation": [0, 1.57, 0]
    },
    {
      "type": "createSphere",
      "options": { "radius": 0.5, "lineType": "translation" }
    }
  ]
}
```

Each object in the `elements` array has:
-   `type`: **(Required)** A string that is the **exact name** of a function in `elemental-shapes.js`.
-   `options`: **(Required)** An object containing the parameters for that shape function (e.g., `radius`, `color`, `lineType`, `normal`).
-   `position`: (Optional) An array of `[x, y, z]` coordinates to move the shape relative to the center.
-   `rotation`: (Optional) An array of `[x, y, z]` rotations in radians (`Math.PI` = 180°).

### Available Shape Types (`type`)

-   `createLine`
-   `createDisk` (supports `lineType` and `normal`)
-   `createPlane` (supports `normal`)
-   `createPlaneOfParallelLines` (supports `normal`)
-   `createBoxOfParallelLines`
-   `createColoredBox` (for a simple colored wireframe)
-   `createTranslation`
-   `createMoment`
-   `createSphere` (supports `lineType`)
-   `createCylindroid`
-   `createHyperbolicParaboloid`
-   `createHyperboloid`
