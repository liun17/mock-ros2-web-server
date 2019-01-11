/*
* Created: Testing for RMF Project (Tan You Liang), Nov 2018
* Usage: Establish a webserver for front end communication without ros2 and rclnodejs setup
*
* Not supported currently
*/

var express = require('express')

var app = express()

var WebSocketServer = require('ws').Server;

let callstatus = 0;

// --------------- websocket stuffs -----------------

wss = new WebSocketServer({port: 8888, path: "/ws"})
// wss = new WebSocketServer({server: app, path: "/ws"})

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('[WS]::Received Msg from frontend: %s', message)
    
    //if its a number, juz for safety
    if ( !Number.isNaN( Number(message) ) ){
      console.log('[WS]::Received a number: %s', message)
      callstatus = Number(message);
    }
  })

  var send_ws = setInterval(
    function(){

      // check if websocket is closed
      // -- mode: CONNECTING, OPEN, CLOSING, CLOSED
      if(ws.readyState === ws.CLOSED){
        // Do your stuff...
        console.log("[WS]::Websocket port is closed")
        clearInterval(send_ws);
      }
      else{
        console.log("[WS]:: - Sending ws msg to frontend")
        ws.send(callstatus);
      }
    },
    1000
  )
})


// --------------- nodejs stuffs -----------------


app.get('/', function (req, res) {
  console.log("Route is not avail...");
})

// Manually provide acknowledgement
app.get('/ack/:status', function(req, res) {
  console.log("Change Status!!")
  callstatus = Number(req.params.status);
});

// here is testing code for mock server

app.get('/patient', function (req, res) {
  res.sendFile(__dirname + '/patient_display.html');
})

app.use('/static', express.static(__dirname + '/static/'));


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})