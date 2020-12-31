variable "prefix" {
  default = "ng-chat-server"
}

variable "project" {
  default = "ng-chat-server"
}

variable "region" {}

variable "vpc_cidr" {}

variable "ec2_key_pair" {
  default = "testKP"
}

variable "public_subnet_cidr" {
  type = list(string)
}

variable "private_subnet_cidr" {
  type = list(string)
}

variable "availability_zone" {
  type = list(string)
}

variable "public_subnet_names" {
  type = list(string)
}

variable "private_subnet_names" {
  type = list(string)
}
