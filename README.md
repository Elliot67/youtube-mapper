# Youtube mapper

Create a graph from youtube videos by following end screen links. Helpful to easily visualize interactive video paths.

## Download

Available for Windows, MacOS and Linux in the [release panel](https://github.com/Elliot67/youtube-mapper/releases).

## Development

Because the data comes from scraping, the application needs to be updated each time youtube change their API. Feel free to create issues and/or PR to report any errors or possible improvements.

### Libraries

- [ytdl-core](https://github.com/fent/node-ytdl-core) - Scrap youtube data
- [dagre-d3](https://github.com/dagrejs/dagre-d3) - Create the graph
- [d3](https://github.com/d3/d3) - Show the graph in the app
