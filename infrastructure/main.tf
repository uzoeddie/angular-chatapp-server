terraform {
  backend "s3" {
    bucket  = "terraform-chat-app-backend-test"
    key     = "chat-app.tfstate"
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
