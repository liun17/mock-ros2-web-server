# mock-ros2-web-server
Testing on ROS2 rclnodejs webserver

## Environment Setup

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

