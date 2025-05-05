# Architecture

This application uses the [Neural Numbers app](https://github.com/IMAGINARY/neural-numbers) as a 
component library (something directly supported by this app) but implements its own and very 
different UI.

Components used are:

- `NeuralNumbers`: The main component that renders the input field, output field, and the bars.
- `NeuralNumbersTrainingController`: A controller that handles the training of the neural network.

The original training UI component is not used, and instead replaced by a new custom one that supports
a different UI.

## Toolset

This is a Webpack-based single page application. Webpack takes care of bundling JS and SASS files, 
and generating the HTML file that hosts them.

## Main source files

(all paths relative to `src/js`)

- [`main.js`](src/js/main.js)`: Main entry point. It loads the configuration, translations, and 
  handles the main app and an app scaler to resize it to the screen.
- [`lib/autostadt-neural-numbers-app.js`](src/js/lib/autostadt-neural-numbers-app.js): The main
  application component. It creates the main Neural Numbers components and handles the UI around them.
- [`lib/training-panel-component.js`](src/js/lib/training-panel-component.js): The new component
  that implements the training UI.

## Main directories

- `art`: Source art assets (Adobe Illustrator format).
- `config`: Data used by the app.
- `src`: The main source code of the app (HTML, SASS and JS files).
- `static`: Static assets (e.g. images, icons, etc.)
- `tr`: Translation files.
