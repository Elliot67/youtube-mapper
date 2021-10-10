<p align="center"><img width="150" src="./.repo/youtube-mapper-icon.png" alt="Vue logo"></p>

<h1 align="center">Youtube mapper</h1>
<p align="center">Create a graph from youtube videos by following end screen links. Helpful to easily visualize interactive video paths.</p>

## Download

Available for Windows, MacOS and Linux in the [release panel](https://github.com/Elliot67/youtube-mapper/releases).

## Development

Because the data comes from scraping, the application needs to be updated each time youtube change their internal API. Feel free to create issues and/or PR to report any errors or possible improvements.

### Libraries used

- [ytdl-core](https://github.com/fent/node-ytdl-core) - Scrap youtube data
- [dagre-d3](https://github.com/dagrejs/dagre-d3) - Create the graph
- [d3](https://github.com/d3/d3) - Show the graph in the app

### Run the project

Once the project is installed with `yarn install`, you have to execute :

- `yarn run f-watch` to build and watch the front
- `yarn run b-watch` to build and watch the back
- `yarn run b-start` to launch the electron application

You can also launch the electron application with the build-in VSCode debugger with <kbd>F5</kbd>.
