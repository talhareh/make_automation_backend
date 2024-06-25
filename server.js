const WebSocket = require('websocket').server;
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

const webSocketServer = new WebSocket({
  httpServer: server,
});

let connectedClients = [];

webSocketServer.on('request', (request) => {
  console.log('connection request received');
  const connection = request.accept(null, request.origin);
  connectedClients.push(connection);

  connection.on('message', (message) => {
    console.log(message);
  });

  connection.on('close', (reasonCode, description) => {
    connectedClients = connectedClients.filter(client => client !== connection);
  });
});

app.use(bodyParser.json());

app.get('/',(req,res)=>{
  res.status(200).json({msg:'I am alive'})
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
    console.error('Error parsing JSON:', error);
    res.status(400).json({ error: 'Invalid JSON payload' });
  }
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;