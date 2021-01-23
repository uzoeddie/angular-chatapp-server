######################
# EC2
######################
# resource "aws_instance" "public_cloud_instance" {
#   count                  = length(var.public_subnet_cidr)
#   ami                    = "ami-03c3a7e4263fd998c"
#   instance_type          = "t2.micro"
#   key_name               = var.ec2_key_pair # Manually created on AWS console
#   subnet_id              = aws_subnet.public_subnets[count.index].id
#   vpc_security_group_ids = [aws_security_group.ec2_public_security_group.id]

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-${format("public-ec2-%d", count.index + 1)}")
#   )
#   user_data = <<-EOF
#               #!/bin/bash
#               yum update -y
#               yum install -y httpd
#               systemctl start httpd.service
#               systemctl enable httpd.service
#               echo "Hi Friend I am public EC2!!!! : $(hostname -f)" > /var/www/html/index.html
#               EOF
# }

# resource "aws_instance" "private_cloud_instance" {
#   # count                  = length(var.private_subnet_cidr)
#   ami                    = "ami-03c3a7e4263fd998c"
#   instance_type          = "t2.micro"
#   key_name               = var.ec2_key_pair
#   subnet_id              = aws_subnet.private_subnets[count.index].id
#   vpc_security_group_ids = [aws_security_group.ec2_private_security_group.id]

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-${format("private-ec2-%d", count.index + 1)}")
#   )

#   user_data = <<-EOF
#               #!/bin/bash
#               yum update -y
#               yum install -y httpd
#               systemctl start httpd.service
#               systemctl enable httpd.service
#               echo "Hi Friend I am public EC2!!!! : $(hostname -f)" > /var/www/html/index.html
#               EOF
# }

# data "aws_ami" "amazon_linux" {
#   most_recent = true
#   owners      = ["amazon"]

#   filter {
#     name   = "owner-alias"
#     values = ["amazon"]
#   }
# }

# resource "aws_launch_configuration" "ec2_private_launch_configuration" {
#   image_id                    = data.aws_ami.launch_configuration_ami.id
#   instance_type               = "t2.micro"
#   key_name                    = var.ec2_key_pair
#   associate_public_ip_address = false
#   iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name
#   security_groups             = [aws_security_group.ec2_private_security_group.id]

#   user_data = <<EOF
#     #!/bin/bash
#     yum update -y
#     yum install httpd -y
#     service httpd start
#     chkconfig httpd on
#     export INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
#     echo "<html><body><h1>Hello from Production Backend at instance <b>"$INSTANCE_ID"</b></h1></body></html>" > /var/www/html/index.html
#   EOF
# }

# resource "aws_launch_configuration" "ec2_public_launch_configuration" {
#   image_id                    = data.aws_ami.launch_configuration_ami.id
#   instance_type               = "t2.micro"
#   key_name                    = var.ec2_key_pair
#   associate_public_ip_address = true
#   iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name
#   security_groups             = [aws_security_group.ec2_public_security_group.id]

#   user_data = <<EOF
#     #!/bin/bash
#     yum update -y
#     yum install httpd -y
#     service httpd start
#     chkconfig httpd on
#     export INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
#     echo "<html><body><h1>Hello from Production Web App at instance <b>"$INSTANCE_ID"</b></h1></body></html>" > /var/www/html/index.html
#   EOF
# }

resource "aws_instance" "PublicEC2" {
  ami                    = "ami-03c3a7e4263fd998c"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.ec2_public_security_group.id]
  subnet_id              = aws_subnet.public_subnet_a.id
  key_name               = var.ec2_key_pair
  user_data              = file("./templates/user-data.sh")
  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-ec2")
  )
}

