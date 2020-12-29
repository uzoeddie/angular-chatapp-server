##############################
# SUBNETS
##############################

##############################
# PUBLIC
##############################
resource "aws_subnet" "public_subnets" {
  count                   = length(var.public_subnet_cidr)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = element(var.public_subnet_cidr, count.index)
  availability_zone       = element(var.availability_zone, count.index)
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-${element(var.public_subnet_names, count.index)}")
  )
}

# resource "aws_subnet" "public-subnet-b" {
#   vpc_id                  = aws_vpc.main.id
#   cidr_block              = "10.0.1.0/24"
#   availability_zone       = "eu-central-1b"
#   map_public_ip_on_launch = true

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-public-subnet-b")
#   )
# }

##############################
# PRIVATE
##############################
resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidr)
  vpc_id            = aws_vpc.main.id
  cidr_block        = element(var.private_subnet_cidr, count.index)
  availability_zone = element(var.availability_zone, count.index)

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-${element(var.private_subnet_names, count.index)}")
  )
}

# resource "aws_subnet" "private-subnet-b" {
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = "10.0.3.0/24"
#   availability_zone = "eu-central-1a"

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-private-subnet-b")
#   )
# }
