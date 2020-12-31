##############################
# PUBLIC
##############################
##############################
# ROUTE TABLE
##############################
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-route-table")
  )
}

########################################
# RT INTERNET GATEWAY ROUTE
########################################
resource "aws_route" "public_igw_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

########################################
# SUBNETS ROUTE TABLE ASSOCIATION
########################################
resource "aws_route_table_association" "public-subnet-1-association" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_route_table.id
}
resource "aws_route_table_association" "public-subnet-2-association" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_route_table.id
}
###########################################################################################################

##############################
# PRIVATE
##############################
##############################
# ROUTE TABLE
##############################
# resource "aws_route_table" "private_route_table" {
#   vpc_id = aws_vpc.main.id

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-private-route-table")
#   )
# }

########################################
# NAT GATEWAY ROUTE
########################################
# resource "aws_route" "nat_gw_route" {
#   route_table_id         = aws_route_table.private_route_table.id
#   destination_cidr_block = "0.0.0.0/0"
#   nat_gateway_id         = aws_nat_gateway.nat_gw.id
# }

########################################
# SUBNETS ROUTE TABLE ASSOCIATION
########################################
# resource "aws_route_table_association" "private-subnet-1-association" {
#   subnet_id      = aws_subnet.private_subnet_a.id
#   route_table_id = aws_route_table.private_route_table.id
# }
# resource "aws_route_table_association" "private-subnet-2-association" {
#   subnet_id      = aws_subnet.private_subnet_b.id
#   route_table_id = aws_route_table.private_route_table.id
# }


