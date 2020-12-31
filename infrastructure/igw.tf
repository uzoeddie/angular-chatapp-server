######################
# INTERNET GATEWAY
######################

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-vpc-igw")
  )
}

#############################
# ELASTIC IP FOR NAT GATEWAY
#############################

# resource "aws_eip" "nat_gw_eip" {
#   vpc                       = true
#   associate_with_private_ip = "10.0.0.5"
#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-nat-gw-eip")
#   )
# }

######################
# NAT GATEWAY
######################

# resource "aws_nat_gateway" "nat_gw" {
#   allocation_id = aws_eip.nat_gw_eip.id
#   subnet_id     = aws_subnet.public_subnet_a.id

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-public-a")
#   )
#   depends_on = [aws_eip.nat_gw_eip]
# }
