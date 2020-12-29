######################
# ALB
######################
resource "aws_lb" "webapp_load_balancer" {
  load_balancer_type = "application"
  name               = "${local.prefix}-webapp"
  internal           = false
  subnets            = aws_subnet.public_subnets.*.id
  security_groups    = [aws_security_group.elb_security_group.id]

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-subnet")
  )
}

resource "aws_lb_target_group" "frontend_http_lb" {
  name     = "${local.prefix}-fe"
  vpc_id   = aws_vpc.main.id
  port     = 80
  protocol = "HTTP"
  health_check {
    path                = "/"
    port                = "80"
    protocol            = "HTTP"
    healthy_threshold   = 5
    unhealthy_threshold = 2
    interval            = 5
    timeout             = 4
    matcher             = "200"
  }
  stickiness {
    type    = "lb_cookie"
    enabled = true
  }
  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-public-subnet")
  )
}

resource "aws_lb_target_group_attachment" "target_group_alb" {
  target_group_arn = aws_lb_target_group.frontend_http_lb.arn
  count            = length(var.public_subnet_cidr)
  port             = 80
  target_id        = element(aws_instance.public_cloud_instance.*.id, count.index)
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.webapp_load_balancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_http_lb.arn
  }
}
