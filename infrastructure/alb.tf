######################
# ALB TARGET GROUP
######################

resource "aws_alb_target_group" "server_backend_tg" {
  name                 = "${local.prefix}-be"
  vpc_id               = aws_vpc.main.id
  port                 = 5000 # port number of your server
  protocol             = "HTTP"
  deregistration_delay = 60

  health_check {
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 30
    timeout             = 20
    matcher             = "200"
  }

  stickiness {
    type    = "lb_cookie"
    enabled = true
  }


  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-tg")
  )
}

# This is for when you directly create an EC2 instance
# resource "aws_alb_target_group_attachment" "dev_target_group_attachment" {
#   target_group_arn = aws_alb_target_group.server_backend_tg.arn
#   target_id        = aws_instance.ec2_server.id
#   port             = 5000 # port number of your server
# }

######################
# ALB
######################

resource "aws_alb" "server_load_balancer" {
  name                       = "${local.prefix}-server"
  load_balancer_type         = "application"
  internal                   = false
  subnets                    = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id, aws_subnet.public_subnet_c.id]
  security_groups            = [aws_security_group.alb_security_group.id]
  enable_deletion_protection = false
  ip_address_type            = "ipv4"

  tags = merge(
    local.common_tags,
    map("Name", "${local.prefix}-ALB")
  )
}

resource "aws_alb_listener" "alb_https_listener" {
  load_balancer_arn = aws_alb.server_load_balancer.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.cert_validation.certificate_arn
  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.server_backend_tg.arn
  }
}

# Always good practice to redirect http to https
resource "aws_alb_listener" "alb_http_listener" {
  load_balancer_arn = aws_alb.server_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_listener_rule" "alb_https_listener_rule" {
  listener_arn = aws_alb_listener.alb_https_listener.arn
  priority     = 100
  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.server_backend_tg.arn
  }
  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
