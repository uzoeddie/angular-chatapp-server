region               = "eu-central-1"
vpc_cidr             = "10.0.0.0/16"
availability_zone    = ["eu-central-1a", "eu-central-1b"]
public_subnet_names  = ["public_subnet_1a", "public_subnet_1b"]
private_subnet_names = ["private_subnet_1a", "private_subnet_1b"]
public_subnet_cidr   = ["10.0.0.0/24", "10.0.1.0/24"]
private_subnet_cidr  = ["10.0.2.0/24", "10.0.3.0/24"]
