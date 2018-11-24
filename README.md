# mock-ros2-web-server
Testing on ROS2 rclnodejs webserver

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

* TILL HERE, YOU CAN EVEN USE `DOCKER` TO HAVE A SETUP ROS2 and RCLNODEJS ENVIRONMENT
* TBC -> link to my own docker

#### 3) Setup NodeJS, RCLNODEJS and ROS2

a) Compile and source ROS2 .msg file 
```
cd .../ROS2_dir/src
git clone XXXX
colcon build --symlink-install --packages-select XXXX
source install/local_setup.bash
```

b) Generate Msg File in RCLNodejs
```
node rclnodejs/script/generate_messages.js 
### nodejs msg will be generated according to available sys ros2 msg
```

## Setup via Docker

Install docker [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)

Access this site: https://hub.docker.com/r/tanyouliang95/ros2-nodejs-mock/
```
docker pull tanyouliang95/ros2-nodejs-mock
docker run -it tanyouliang95/ros2-nodejs-mock
```

## Error Faced

* Mainly not recommended to use `develop` branch for rcl nodejs
* cant `npm install` in ubuntu 16 with `ros2 ardent` binary installed
* with ros2 bouncy's source being installed, prob still lies, cuz path too long, weird stuff happened
* Ros2 topic communication between Ardent and bouncy seems to have some issue


## Testing of Webserver

**Publish dummy msg:**

```
ros2 topic pub /patient_device/caller_id std_msgs/String "data: AAAA"
```

**Subscribe Dummy Msg:**

Check IP via 'ifconfig', then access this via web browser: `http://172.17.0.2:5000/ack/{ANY NUMBER}`

```
ros2 topic echo /patient_device/call_acknowledgement
```

