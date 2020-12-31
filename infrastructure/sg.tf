######################
# SECURITY GROUPS
######################

resource "aws_security_group" "ec2_public_security_group" {
  name        = "${local.prefix}-public-ec2-sg"
  description = "Internet access for public EC2"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.elb_security_group.id]
  }

  ingress {
    from_port   = 22
    protocol    = "TCP"
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"] # My own ip for ssh access
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

# resource "aws_security_group" "ec2_private_security_group" {
#   name        = "${local.prefix}-private-ec2-sg"
#   description = "Only allow public SG resources to access private instances"
#   vpc_id      = aws_vpc.main.id

#   ingress {
#     from_port       = 0
#     to_port         = 0
#     protocol        = "-1"
#     security_groups = [aws_security_group.ec2_public_security_group.id]
#   }

#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   ingress {
#     from_port   = 80
#     to_port     = 80
#     protocol    = "TCP"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "Allow heatlh checking for instances using this SG"
#   }

#   egress {
#     protocol    = "tcp"
#     from_port   = 443
#     to_port     = 443
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   egress {
#     protocol    = "tcp"
#     from_port   = 80
#     to_port     = 80
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   egress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = local.common_tags
# }

resource "aws_security_group" "elb_security_group" {
  name        = "${local.prefix}-elb-sg"
  description = "ELB Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    protocol    = "tcp"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow web traffic to load balancer"
  }

  egress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

resource "aws_security_group" "sg_elasticache_cluster" {
  name        = "${local.prefix}-sg-elasticache"
  description = "Allow access to elasticache service"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "TCP"
    security_groups = [aws_security_group.ec2_public_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}
