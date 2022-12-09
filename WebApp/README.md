# Welcome to the Web App of RaceCARduino

## Setup

This project was created with node@16 and yarn version 1.22.19

To install all packages just run

### `yarn`

in the project directory.

## Run Web App

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser (Only Google Chrome is supported, tested with version 108).

## Export Web App

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Additional Information

This web app downloads a model from the tensorflow hub and might break if the hub stops serving the specific model. The model is https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4
