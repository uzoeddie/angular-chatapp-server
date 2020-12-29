######################
# EC2
######################
resource "aws_instance" "public_cloud_instance" {
  count                  = length(var.public_subnet_cidr)
  ami                    = "ami-03c3a7e4263fd998c"
  instance_type          = "t2.micro"
  key_name               = var.ec2_key_pair # Manually created on AWS console
  subnet_id              = aws_subnet.public_subnets[count.index].id
  vpc_security_group_ids = [aws_security_group.ec2_public_security_group.id]

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-${format("public-ec2-%d", count.index + 1)}")
  )
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd.service
              systemctl enable httpd.service
              echo "Hi Friend I am public EC2!!!! : $(hostname -f)" > /var/www/html/index.html
              EOF
}

resource "aws_instance" "private_cloud_instance" {
  count                  = length(var.private_subnet_cidr)
  ami                    = "ami-03c3a7e4263fd998c"
  instance_type          = "t2.micro"
  key_name               = var.ec2_key_pair
  subnet_id              = aws_subnet.private_subnets[count.index].id
  vpc_security_group_ids = [aws_security_group.ec2_private_security_group.id]

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-${format("private-ec2-%d", count.index + 1)}")
  )

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd.service
              systemctl enable httpd.service
              echo "Hi Friend I am public EC2!!!! : $(hostname -f)" > /var/www/html/index.html
              EOF
}
