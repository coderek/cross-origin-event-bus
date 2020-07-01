
var StaticServer = require('static-server');
var server = new StaticServer({
  rootPath: '.',            // required, the root of the server file tree
  port: process.argv[2],               // required, the port to listen
});

server.start(function () {
  console.log('Server listening to', server.port);
});
