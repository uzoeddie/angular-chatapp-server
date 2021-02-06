#!/bin/bash

DIR="/home/ec2-user/angular-chatapp-server"
if [ -d "$DIR" ]; then
  cd home/ec2-user
  sudo rm -rf angular-chatapp-server
  # cd /home/ec2-user/angular-chatapp-server
  # sudo rm -rf appspec.yml
  # sudo rm -rf node_modules
  # sudo rm -rf build
else
  echo "Directory does not exist"
fi


