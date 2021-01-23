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
