terraform {
  backend "s3" {
    bucket  = "angular-chatapp-server-tf-state"
    key     = "angular-chatapp-server.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"
  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManageBy    = "Terraform"
    Owner       = "Uzochukwu Eddie Odozi"
  }
}
