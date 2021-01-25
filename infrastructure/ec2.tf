######################
# EC2
######################
resource "aws_instance" "ec2_server" {
  ami                    = "ami-03c3a7e4263fd998c"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.ec2_public_security_group.id]
  subnet_id              = aws_subnet.public_subnet_a.id
  key_name               = var.ec2_key_pair
  iam_instance_profile   = aws_iam_instance_profile.ec2_instance_profile.name
  user_data              = file("./scripts/user-data.sh")
  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-ec2")
  )
}

