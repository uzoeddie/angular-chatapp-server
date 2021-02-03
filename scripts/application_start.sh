#!/bin/bash

cd /home/ec2-user/angular-chatapp-server
# sudo rm -rf build
sudo npm run build
# sudo pm2 stop all
sudo npm start
