const http = require('http');

const hostname = '127.0.0.1'; // localhost
const port = 3000;

const server = http.createServer((request, response) => {
  if (request.method === 'GET') {
      // Informationen an den Client senden
      response.setHeader("Content-Type", "application/json");
      const data = { message: "Hello World"};
      response.end(JSON.stringify(data));
  }
  if (request.method === 'POST') {
    // Daten vom Client empfangen
    let jsonString = '';
    request.on('data', (data) => {
      jsonString += data;
    });
    request.on('end', () => {
      console.log(JSON.parse(jsonString));
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});