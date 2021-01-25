##############################
# PUBLIC SUBNETS
##############################
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = "eu-central-1a"
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-a")
  )
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-central-1b"
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-b")
  )
}
resource "aws_subnet" "public_subnet_c" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "eu-central-1c"
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-c")
  )
}
