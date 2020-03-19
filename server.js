#!/usr/bin/env node


const express = require('express');
const index = require('serve-index');
const logger = require('morgan');
const server = express();
const portArg = parseInt(process.argv[2], 10) || 8080;

if(portArg <= 1024) {
  console.log('Port must be above 1024!');
  process.exit(1);
}

server.use(logger('tiny'));
server.use('/cli', express.static(__dirname + '/dist'));
server.use('/cli', index(__dirname + '/dist', { icons: true }));
server.use((req, res) => {
  res.status(404);
  res.send('<body style="font-family:sans-serif;color:white;background:rgba(0, 0, 255, 0.87);"><h1>Page not found</h1><p style="font-family:sans-serif">It is possible you are missing this application.</p></body>');
});

server.listen(portArg, () => {
  console.log(`Serving website on http://localhost:${portArg}`);
});
