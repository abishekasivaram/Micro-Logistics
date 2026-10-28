const fs = require('fs');
const { JSDOM } = require('jsdom');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

// Serve the 'dist' directory
const serve = serveStatic('dist', { index: ['index.html'] });
const server = http.createServer((req, res) => serve(req, res, finalhandler(req, res)));

server.listen(8080, () => {
  JSDOM.fromURL('http://localhost:8080/customer-dashboard', {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  }).then(dom => {
    // Capture errors
    dom.window.console.log = (...args) => console.log('LOG:', ...args);
    dom.window.console.error = (...args) => console.log('ERROR:', ...args);

    // Wait a bit for React to render
    setTimeout(() => {
      console.log('HTML:', dom.window.document.body.innerHTML);
      process.exit(0);
    }, 5000);
  });
});
