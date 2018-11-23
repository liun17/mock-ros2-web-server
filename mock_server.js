/*
* Created: Testing for RMF Project (YouLiang)
*
* Folder struct:
*  - Dir/
*	 - /rclnodejs/
*	 - mock_server.js
*
*/

var express = require('express');
var app = express();

const rclnodejs = require(__dirname + '/rclnodejs/index.js');
let String = rclnodejs.require('std_msgs').msg.String;
let SestoApiInfo = rclnodejs.require('sesto_api_msgs').msg.SestoApiInfo;
let ServerResponse = rclnodejs.require('sesto_api_msgs').msg.ServerResponse;

// rclnodejs.regenerateAll()

rclnodejs.init().then(() => {
	const node = rclnodejs.createNode('task_info_ui');
	node.createSubscription(ServerResponse, 'response', (msg) => {
		console.log(`Received message : ${typeof msg}`, msg.response);
		var res_msg = JSON.parse(msg.response);
		if (msg.method == 'createAdhocRequest') {
			//alert('Request succesfully created with id '+res_msg.req_id);
			console.log('Request succesfully created with id ' + res_msg.req_id);
			//msg1.method="getUserReqStates";
			//msg1.requests[0]=res_msg.req_id;
			//publisher.publish(msg1);
		}
		else if (msg.method == 'getUserReqStates') {
			console.log('AGV with id ' + res_msg.states[0].payload_states[0].agv_id + 'is assigned');
			console.log('Task state is ' + res_msg.states[0].payload_states[0].state);
		}
	});

	const publisher = node.createPublisher(SestoApiInfo, 'task_info');
	rclnodejs.spin(node);

	//	var date = new Date();
	let msg = new String();
	let msg1 = new SestoApiInfo();
	msg1.method = "createAdhocRequest";
	msg1.user_id = 1234;
	msg1.pickup = "";
	msg1.delivery = "";
	msg1.payloads = ["ITEM" + new Date().toISOString()];
	msg1.type = 0;
	msg1.start_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	msg1.delivery_end = 30;
	msg1.agv_id = 0;
	msg1.req_id = 0;
	msg1.requests = []

	app.set('port', process.env.PORT || 5003);
	app.use(express.json());
	app.use(express.static(__dirname + '/js'));
	app.use('/submit_task_msg', function (req, res) {
		msg1.method = "createAdhocRequest";
		msg1.payloads = ["ITEM" + Date.now().toString().substring(8, 15)];
		msg1.start_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		all_messages = req.body;
		for (var i = 0; i < all_messages.length; i++) {
			console.log(all_messages[i].name + '  :  ' + all_messages[i].value);
			if (all_messages[i].name == "pickup") {
				//spec.fields.pickup=all_messages[i].value;
				msg1.pickup = all_messages[i].value;
				console.log("pickup" + msg1.pickup);
			}
			else if (all_messages[i].name == "delivery") {
				msg1.delivery = all_messages[i].value;
				console.log("delivery" + msg1.delivery);
			}
			msg.data = all_messages[i].value;
		}
		publisher.publish(msg1);
		res.json('Request Submitted, yayyyyyy!!!!!!!');
	});

	app.use('/submit_status_msg', function (req, res) {
		msg1.method = "getUserReqStates";
		msg1.requests = []
		publisher.publish(msg1);
		res.json('Status Request Submitted');
	});

	app.use('/', function (req, res) {
		res.sendFile(__dirname + '/index.html');
	});

	app.listen(app.get('port'), function () {
		console.log("Node Server running at port " + app.get('port'));
	});

});