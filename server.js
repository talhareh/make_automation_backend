const WebSocket = require('websocket').server;
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const httpServer = http.createServer(app);
const wsServer = http.createServer();

const webSocketServer = new WebSocket({
  httpServer: wsServer,
});

let connectedClients = [];

webSocketServer.on('request', (request) => {
  console.log('WebSocket connection request received');
  const connection = request.accept(null, request.origin);
  connectedClients.push(connection);

  connection.on('message', (message) => {
    console.log('Received message:', message);
  });

  connection.on('close', (reasonCode, description) => {
    connectedClients = connectedClients.filter(client => client !== connection);
    console.log('Client disconnected:', description);
  });
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log('HTTP connection checked');
  res.status(200).json({ msg: 'I am alive' });
});

app.post('/echo', (req,res)=> {
  console.log({request: req.body})
  const echo = req.body
  echo.msg = 'What goes around comes around'
  res.status(200).json(echo)

})

app.get('/abc', ()=>{
  res.status(200).json({msg:'abc'})
})

app.post('/fromMake', (req, res) => {
  const { topic, article } = req.body;

  try {
    connectedClients.forEach(client => {
      if (client.connected) {
        client.sendUTF(JSON.stringify({ topic, article }));
      }
    });

    res.status(200).json({ message: 'Data sent to clients successfully' });
  } catch (error) {
    console.error('Error sending data:', error);
    res.status(400).json({ error: 'Failed to send data to clients' });
  }
});

const HTTP_PORT = 4000;
const WS_PORT = 4001;

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server is listening on port ${HTTP_PORT}`);
});

wsServer.listen(WS_PORT, () => {
  console.log(`WebSocket server is listening on port ${WS_PORT}`);
});

module.exports = { app, httpServer, wsServer };
