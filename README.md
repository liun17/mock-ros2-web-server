# mock-ros2-web-server
This package is a mock ROS2 rclnodejs webserver, solely for testing purpose. For ros1 nodejs communication, pls refer to [my package here](https://github.com/tanyouliang95/WebPlaneVisualizer). For setting up the environment, theres 2 approaches: `Normal Environment Setup` or `Docker`. Here docker is the recommended way for easy setup.

## Normal Environment Setup

#### 1) Install NodeJs
install nodejs with a version above v8. Use NVM for installation

```
sudo apt-get update
sudo apt-get install build-essential libssl-dev
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.profile
nvm ls-remote
```

Select your prefered version
```
nvm install 8.9.4
nvm use 8.9.4
node -v
```

* Nodejs installation was refered to [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04)


#### 2) Install RCL Nodejs

* ROS2 Bouncy needs to be install via deb (binary), link is [here](https://index.ros.org/doc/ros2/Linux-Install-Debians/)

```
git clone https://github.com/RobotWebTools/rclnodejs
git checkout bouncy-bolson
cd rclnodejs
git submodule update --init --recursive
```

Source ros2 before npm install `source ~/ros2_dir/install/local_setup.bash`

```
npm install
```

#### 3) Setup NodeJS, RCLNODEJS and ROS2

a) Compile and source ROS2 .msg file  (In this case, `patient_device`)
```
cd .../ROS2_dir/src
git clone XXXX
colcon build --symlink-install --packages-select XXXX
source install/local_setup.bash
```

b) Generate Msg File in RCLNodejs
```
node rclnodejs/scripts/generate_messages.js 
### nodejs msg will be generated according to available sys ros2 msg
```

### Error Faced

* Mainly not recommended to use `develop` branch for rcl nodejs
* cant `npm install` in ubuntu 16 with `ros2 ardent` binary installed
* with ros2 bouncy's source being installed, prob still lies, cuz path too long, weird stuff happened
* Ros2 topic communication between Ardent and bouncy seems to have some issue
* If `colcon` is not available, `pip install python3-colcon-common-extensions`


## Setup via Docker

You can even use `DOCKER` to have a setup ROS2 and RCLNODEJS environment. This is a simpler and hassle free way to setup a compatible environment.

Follow the instruction here to install docker, [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)

Access this site: https://hub.docker.com/r/tanyouliang95/ros2-nodejs-mock/

```
docker pull tanyouliang95/ros2-nodejs-mock
docker run -it --network=host tanyouliang95/ros2-nodejs-mock
cd /home/mock-ros2-web-server
git pull  # ensure newest version
```

To save (Open another terminal) 
```
docker ps     ## check CONTAINER_ID , e.g. c62f5ebf5839
docker commit -m "Commentssss..." -a 'you_liang' c62f5ebf5839 tanyouliang95/ros2-nodejs
docker history tanyouliang95/ros2-nodejs  # check commits
```

* ~ to exit docker: ctrl-p, then ctrl-q*

## Testing of Webserver

**Subscribe Dummy Msg:**

- To control publish status manually, use `http://172.17.0.2:5000/ack/{ANY NUMBER}`


```
ros2 topic echo /patient_device/call_acknowledgement
```

**Publish dummy msg:**

```
ros2 topic pub /patient_device/caller_id std_msgs/String "data: AAAA"
```

### Procedure

Open a terminal, and `cd /home/mock-ros2-web-server`. Then run the the nodejs server:

```
node mock_server.js
```

Here, open another terminal with ros2 environment being setup. Test the server by pub sub to `ros2 topic`. 

Check IP via `ifconfig`, then access this via web browser:  `http://172.17.0.2:5000/patient`. 

For multiple devices, appropriate 'device_id' need to map to the accessing frontend webpage. Thus, to initiate the 'device_id' of the webpage, Just use this url:

```
http://172.17.0.2:5000/patient?DEVICE_ID  # in web browser
```

* the `DEVICE_ID` here should be the same as the 'caller_id' of the ROS2 Publisher.

When ros2 topic: `/patient_device/caller_id` sub msg is received, frontend (webpage) will display img of "call mode", and provide acknowledgement msg of '1' to `/patient_device/call_acknowledgement` ros2 topic.

When "End Call" button on webpage is hit, frontend (webpage) will display img of "pending mode". Acknowledgement msg '0' will send to the `/patient_device/call_acknowledgement` ros2 topic, successfully end the call proccess.



## Note

- This is just a prototype (CHILL....)
- Front end and backend communication is via `Websocket` TCP :8888 port
- This package is mainly working along side with a patient call button, with light indicator
- the patient call button will trigger this whole call proccess via ros2 dds and websocket
- Eventually `WEBRTC` will be used for video call

* To solve IP network problem between external devices while using ROS2 in a container, use arg ` --network=host`.
* Without container, it's recommendable to use `Ubuntu 18` with RCLNODEJS installed, and run the node server.



