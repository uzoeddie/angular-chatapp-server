terraform {
  backend "s3" {
    bucket  = "app-cinema-dev"
    key     = "app-cinema-dev.tfstate"
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
