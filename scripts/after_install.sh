#!/bin/bash

cd /home/ec2-user/angular-chatapp-server
# sudo rm -rf node_modules
sudo npm install
sudo rm -rf ./node_modules/@types/mongoose
sudo rm -rf env-file.zip
sudo rm -rf .env
aws s3 sync s3://env-zip-file .
unzip env-file.zip
