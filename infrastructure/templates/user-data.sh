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

cd /home/ec2-user

sudo yum update -y

# Check if Node.js is installed. If not, install it with nvm
if [ $(program_is_installed node) == 1 ]; then
  echo "Node is installed"
else
  echo "Installing NodeJS"
  sudo curl --silent --location https://rpm.nodesource.com/setup_current.x | sudo bash -
  sudo yum -y install nodejs
  sudo npm install -g npm
  sudo npm install -g npm-check-updates
fi

# Check if Git is installed
if [ $(program_is_installed git) == 1 ]; then
  echo "Git is installed"
else
  sudo yum install git -y
fi

# Check if Docker is installed
if [ $(program_is_installed docker) == 1 ]; then
  echo "Docker is installed"
else
  # (for amazon linux 2)
  sudo amazon-linux-extras install docker -y
  # start docker service
  sudo systemctl start docker
  # start docker redis server in detach mode
  sudo docker run --name chatapp-redis -p 6379:6379 --restart always --detach redis
fi

# Check if redis-commander is installed
if [ $(program_is_installed redis-commander) == 1 ]; then
  echo "redis-commander is installed"
else
  npm install -g redis-commander
  nohup redis-commander &
fi

# Check if redis-commander is installed
if [ $(program_is_installed pm2) == 1 ]; then
  echo "pm2 is installed"
else
  sudo npm install -g pm2
fi

# Check if awscli is installed
if [ $(program_is_installed aws) == 1 ]; then
  echo "aws cli is installed"
else
  sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  sudo unzip awscliv2.zip
  sudo ./aws/install
fi

# replace the keys with circleci config vars
aws configure set aws_access_key_id <access_key_id>
aws configure set aws_secret_access_key <secret_access>
aws configure set default.region <region>

DIR="/home/ec2-user/angular-chatapp-server"
if [ -d "$DIR" ]; then
  echo "Directory in the specified path ${DIR} already exists."
  cd angular-chatapp-server
  git pull origin master # find a way to make the branch name dynamic
  npm install
  npm run build
else
  echo "Directory does not exists"
  git clone https://github.com/uzoeddie/angular-chatapp-server.git
  cd angular-chatapp-server
  npm install
  aws s3 sync s3://env-zip-file .
  unzip env-file.zip
  npm run build
  npm start
fi
