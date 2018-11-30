/*
* Created: Testing for RMF Project (Tan You Liang), Nov 2018
* Usage: Establish a webserver for ROS2 to nodejs communication with DDS protocol, 
*        websocket is used for front-backend tcp communication
*
* Folder struct:
*  - Dir/
*	 - rclnodejs/
*	 - /mock-ros2-web-server/
*		- node_modules/
*		- mock_server.js
*		- patient_display.html
*
*
* call status 0: no call, 1: trigger call
*
*/

// TODO: make sure front end deviceID match with caller_ID

var express = require('express');
var app = express();
var WebSocketServer = require('ws').Server;

const rclnodejs = require(__dirname + '/../rclnodejs/index.js');
let String = rclnodejs.require('std_msgs').msg.String;
let Acknowledgement_msg = rclnodejs.require('patient_device').msg.Acknowledgement;

let deviceID_msg = new String();
let ack_msg = new Acknowledgement_msg();

// Global publisher 
let publisher = -1;
let patientDevice_pub = -1;

// call related var
let pending_client_list = new Array(); // client waiting to be sent websocket 'call signal'
let active_client_list = new Array();
let new_activeClient = -1;   // newest frontend client to establish a call
let pending_count = 0;


// ==============================  RCLNodejs stuffs  ==============================

function publish_acknowledgement(ID, status) {
	ack_msg.status = status
	ack_msg.deviceid = ID
	patientDevice_pub.publish(ack_msg);
	console.log("[Publisher]:: Published to /call_acknowledgment"); 
	console.log("\t\t ID: ", ID, "  status: ", status); 
}

rclnodejs.init().then(() => {
	
	const node = rclnodejs.createNode('mock_web_server');
	
	// Sub for patient device: caller id
	node.createSubscription(String, '/patient_device/caller_id', (msg) => {
		console.log("[Subcriber]:: received msg at /caller_id of: ", msg.data)
		current_patient_id = msg.data;
    
    // check if new 'caller_id ' is captured before
    if ( (pending_client_list.indexOf(msg.data) == -1) && (active_client_list.indexOf(msg.data) == -1) ){
      // receive deviceID here will trigged frontend call
      pending_client_list.push( msg.data );
    }

    publish_acknowledgement( msg.data, 1 );	// acknowledgement of received triggered from patient

  });	

	
	// publisher = node.createPublisher(SestoApiInfo, 'task_info');
	patientDevice_pub = node.createPublisher(Acknowledgement_msg, '/patient_device/call_acknowledgement');
	
	console.log(" ------------ RCL Nodejs Init Successfully!!! ------------")
	
	rclnodejs.spin(node);

});




// ==============================  Websocket stuffs  ==============================

wss = new WebSocketServer({port: 8888, path: "/ws"})

wss.on('connection', function (ws) {
  
  // When front end update status to backend
  ws.on('message', function (msg) {
    console.log('[WS]:: Msg from frontend: %s', msg)
    
    var obj = JSON.parse(msg);

    // --------- Received acknowledgement from front end -----------
    if (new_activeClient == obj.Device_id && obj.Status == 1 ){
      console.log('[WS]::Received call started msg for : %s', obj.Device_id)
      // get new client device_id from pending to active list
      pending_client_list.splice(pending_client_list.indexOf(new_activeClient), 1); // remove ele from list
      active_client_list.push( new_activeClient );
      pending_count = 0;
    }

    // ---------- Received end call msg from front end ---------------
    else if ( active_client_list.indexOf(obj.Device_id) != -1 && obj.Status == 0 ){
      console.log('[WS]::Received call end msg for : %s', obj.Device_id)
      active_client_list.splice(active_client_list.indexOf(obj.Device_id), 1); // remove ele from list

      // publish call status to ros2 dds, 3 times, for ensurance
      var pub_count = 0;
      var pub_callend = setInterval(function(){
        publish_acknowledgement(obj.Device_id, Number(obj.Status))
        pub_count = pub_count + 1 ;
        if (pub_count > 3) clearInterval(pub_callend);
      }, 500); 
    }

    else{
      console.log("ERROR!!!! Weird msg received from front end! \n\t Maybe is new inative client =) \n");
    }

  })

  // activate sender every set interval
  var sender_ws = setInterval(
    function(){

      // check if websocket is closed
      // -- mode: CONNECTING, OPEN, CLOSING, CLOSED
      if(ws.readyState === ws.CLOSED){
        // Do your stuff...
        console.log("[WS]::Websocket port is closed")
        clearInterval(sender_ws);
      }
      else{
        // pending client to be converted to an active call
        if( pending_client_list.length != 0 ){
          new_activeClient = pending_client_list[pending_client_list.length - 1];
          console.log("[WS]:: - Sending ws 'startCall' msg to frontend client: ", new_activeClient)
          ws.send(JSON.stringify({
            Device_id: new_activeClient,
            Status: 1     // 1: call (command)
          }));
          pending_count = pending_count + 1;           
        }

        // remove atempting device id from pending list, (tried too many times....)
        if (pending_count > 5){
          pending_client_list.splice(pending_client_list.indexOf(new_activeClient), 1); // remove ele from list
          console.log("[WS]:: Exceeded pending count!!!! stop trying for device_id: ", new_activeClient);
          pending_count = 0;
        }

        // TODO: If END CALL FROM other party (webrtc call)
        // // send status: 0 to front end, so to end their call too
      }
    },
    500
  )
})



// ==============================  NodeJs stuffs  ==============================

app.use(express.json());
app.use(express.static(__dirname + '/js'));


app.use('/home', function (req, res) {
	console.log("load main page");
	res.sendFile(__dirname + '/index.html');
});


// Patient Device UI
app.use('/patient', function (req, res) {
	console.log("[UI]::load patient device page");
	res.sendFile(__dirname + '/patient_display.html');
});

// for all static files in /static folder
app.use('/static', express.static(__dirname + '/static/'));


// Manually provide acknowledgement
app.get('/ack/:status', function(req, res) {
	// res.send(req.params.status);
	ch = req.params.status
	if ( Number.isNaN( Number(ch) ) ){
		console.log("## Input Ack status `NAN` is not a number!!")
		return;
	}
	callstatus = Number(Number(ch));
	publish_acknowledgement('AAAA', Number(ch))
});


app.listen( 5000 ,function(){
	console.log(" Node Server running at port " + 5000);
});