#!/bin/bash

# return 1 if global command line program installed, else 0
function program_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  type $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

# cd /home/ec2-user

sudo yum -y update
sudo yum -y install ruby
sudo yum -y install wget
cd /home/ec2-user
wget https://aws-codedeploy-eu-central-1.s3.eu-central-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

# Check if Node.js is installed. If not, install it with nvm
if [ $(program_is_installed node) == 0 ]; then
  sudo curl --silent --location https://rpm.nodesource.com/setup_current.x | sudo bash -
  sudo yum -y install nodejs
  sudo npm install -g npm
  sudo npm install -g npm-check-updates
fi

# Check if Git is installed
if [ $(program_is_installed git) == 0 ]; then
  sudo yum install git -y
fi

# Check if Docker is installed
if [ $(program_is_installed docker) == 0 ]; then
  # (for amazon linux 2)
  sudo amazon-linux-extras install docker -y
  # start docker service
  sudo systemctl start docker
  # start docker redis server in detach mode
  sudo docker run --name chatapp-redis -p 6379:6379 --restart always --detach redis
fi

# Check if redis-commander is installed
if [ $(program_is_installed redis-commander) == 0 ]; then
  npm install -g redis-commander
  nohup redis-commander &
fi

# Check if redis-commander is installed
if [ $(program_is_installed pm2) == 0 ]; then
  sudo npm install -g pm2
fi

cd /home/ec2-user

git clone -b develop https://github.com/uzoeddie/angular-chatapp-server.git
cd angular-chatapp-server
npm install
sudo rm -rf ./node_modules/@types/mongoose
aws s3 sync s3://env-zip-file .
unzip env-file.zip
npm run build
npm start
