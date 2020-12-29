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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-ec2-sg")
  )
}

resource "aws_security_group" "ec2_private_security_group" {
  name        = "${local.prefix}-private-ec2-sg"
  description = "Only allow public SG resources to access private instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.ec2_public_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-private-ec2-sg")
  )
}

resource "aws_security_group" "elb_security_group" {
  name        = "${local.prefix}-elb-sg"
  description = "ELB Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    protocol    = "tcp"
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow web traffic to load balancer"
  }

  egress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-elb-sg")
  )
}
