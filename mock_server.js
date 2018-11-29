/*
* Created: Testing for RMF Project (Tan You Liang), Nov 2018
* Usage: Establish a webserver for ROS2 to nodejs communication with DDS protocol
*
* Folder struct:
*  - Dir/
*	 - rclnodejs/
*	 - /mock-ros2-web-server/
*		- node_modules/
*		- mock_server.js
*		- patient_display.html
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
let current_patient_id = 'AAAA';
let callstatus = 0;   // FOR FRONTEND -> 0: no call, 1: trigger call



// ==============================  Websocket stuffs  ==============================

ws = new WebSocketServer({port: 8888, path: "/ws"})

ws.on('connection', function (ws) {
  console.log(' Websocket port 8888 is connected ...');
  
  // Remove setInterval
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
		// TODO: send DeviceID only when msg is receive.
        console.log("[WS]:: - Sending ws msg to frontend: ", callstatus)
        ws.send(callstatus);
      }
    },
    1000
  )
})


// When front end update status to backend
ws.on('message', function (message) {
  
  console.log('[WS]::Received Msg from frontend: %s', message)
  
  //if its a number, juz for safety
  if ( !Number.isNaN( Number(message) ) ){
    console.log('[WS]::Received a number: %s', message)
    callstatus = Number(message);

    // publish call status to ros2 dds, 3 times, for ensurance
    var pub_count = 0;
    var pub_callend = setInterval(function(){
      publish_acknowledgement(current_patient_id, Number(callstatus))
      pub_count = pub_count + 1 ;
      if (pub_count > 3){
        clearInterval(pub_callend);
      }
    }, 500); 
  }
})
  

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
    
    // receive deviceID here will trigged frontend call
    // TODO: send deviceID here to frontend
    callstatus = 1;
    if(ws.readyState !== ws.CLOSED){  //if websocket is not closed
      ws.send(callstatus);
    }

    publish_acknowledgement( msg.data, 1 );	// acknowledgement of received triggered from patient

  });	

  
  // publisher = node.createPublisher(SestoApiInfo, 'task_info');
  patientDevice_pub = node.createPublisher(Acknowledgement_msg, '/patient_device/call_acknowledgement');
  
  console.log(" ------------ RCL Nodejs Init Successfully!!! ------------")
  
  rclnodejs.spin(node);

});





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

// This is for testing, send interval msg to /call_acknowledgement
app.get('/send', function (req, res) {
	console.log("submit /send/ status msg being called!!")
	setInterval(function(){ 
		console.log("INTERVAL MODE"); 
		publish_acknowledgement("AAAA", -1);
	}, 3000);
});

// Manually provide acknowledgement
app.get('/ack/:status', function(req, res) {
	// res.send(req.params.status);
	ch = req.params.status
	if ( Number.isNaN( Number(ch) ) ){
		console.log("## Input Ack status `NAN` is not a number!!")
		return;
	}
	callstatus = Number(Number(ch));
	publish_acknowledgement(current_patient_id, Number(ch))
});

app.listen( 5000 ,function(){
	console.log(" Node Server running at port " + 5000);
});








// ============================== Back Up Reference Code ================================

// msg1.method = "createAdhocRequest";
// msg1.user_id = 1234;
// msg1.pickup = "";
// msg1.delivery = "";
// msg1.payloads = ["ITEM" + new Date().toISOString()];
// msg1.type = 0;
// msg1.start_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
// msg1.delivery_end = 30;
// msg1.agv_id = 0;
// msg1.req_id = 0;
// msg1.requests = []

// app.use('/submit_status_msg', function (req, res) {
// 	msg1.method = "getUserReqStates";
// 	msg1.requests = []
// 	publisher.publish(msg1);
// 	res.json('Status Request Submitted');
// 	console.log("submit status msg being called!!")
// });

// app.use('/submit_task_msg', function (req, res) {
	// 	msg1.method = "createAdhocRequest";
	// 	msg1.payloads = ["ITEM" + Date.now().toString().substring(8, 15)];
// 	msg1.start_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
// 	all_messages = req.body;
// 	for (var i = 0; i < all_messages.length; i++) {
	// 		console.log(all_messages[i].name + '  :  ' + all_messages[i].value);
	// 		if (all_messages[i].name == "pickup") {
		// 			//spec.fields.pickup=all_messages[i].value;
		// 			msg1.pickup = all_messages[i].value;
		// 			console.log("pickup" + msg1.pickup);
		// 		}
		// 		else if (all_messages[i].name == "delivery") {
			// 			msg1.delivery = all_messages[i].value;
// 			console.log("delivery" + msg1.delivery);
// 		}
// 		msg.data = all_messages[i].value;
// 	}
// 	publisher.publish(msg1);
// 	res.json('Request Submitted, yayyyyyy!!!!!!!');
// });
