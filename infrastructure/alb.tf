# ######################
# # ALB
# ######################
# resource "aws_lb" "server_load_balancer" {
#   load_balancer_type         = "application"
#   name                       = "${local.prefix}-server"
#   internal                   = false
#   subnets                    = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
#   security_groups            = [aws_security_group.elb_security_group.id]
#   enable_deletion_protection = false

#   # listener {
#   #   instance_port     = 80
#   #   instance_protocol = "HTTP"
#   #   lb_port           = 80
#   #   lb_protocol       = "HTTP"
#   # }

#   # health_check {
#   #   healthy_threshold   = 5
#   #   interval            = 30
#   #   target              = "HTTP:80/"
#   #   timeout             = 10
#   #   unhealthy_threshold = 5
#   # }

#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-load-balancer")
#   )
# }

# # resource "aws_lb_cookie_stickiness_policy" "server_cookie" {
# #   name                     = "cookie-policy"
# #   load_balancer            = aws_elb.server_load_balancer.id
# #   lb_port                  = 80
# #   # cookie_expiration_period = 600
# # }

# resource "aws_lb_target_group" "backend_tg" {
#   name     = "${local.prefix}-be"
#   vpc_id   = aws_vpc.main.id
#   port     = 80
#   protocol = "HTTP"
#   health_check {
#     path                = "/"
#     port                = "80"
#     protocol            = "HTTP"
#     healthy_threshold   = 5
#     unhealthy_threshold = 2
#     interval            = 5
#     timeout             = 4
#     matcher             = "200"
#   }
#   stickiness {
#     type    = "lb_cookie"
#     enabled = true
#   }
#   tags = merge(
#     local.common_tags,
#     map("Name", "${local.prefix}-backend")
#   )
# }

# resource "aws_lb_listener" "dfsc_https" {
#   load_balancer_arn = aws_lb.server_load_balancer.arn
#   port              = 443
#   protocol          = "HTTPS"
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.backend_tg.arn
#   }
# }

# resource "aws_lb_listener_rule" "dfsc_admin_https" {
#   listener_arn = aws_lb_listener.dfsc_https.arn
#   priority     = 100
#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.backend_tg.arn
#   }
#   condition {
#     path_pattern {
#       values = ["/*"]
#     }
#   }
# }

# # resource "aws_lb_target_group_attachment" "target_group_alb" {
# #   target_group_arn = aws_lb_target_group.backend_tg.arn
# #   port             = 80
# #   # target_id        = data.aws_ami.launch_configuration_ami.id
# #   target_id        = "ami-03c3a7e4263fd998c"
# # }

# # resource "aws_lb_listener" "backend" {
# #   load_balancer_arn = aws_lb.server_load_balancer.arn
# #   port              = 80
# #   protocol          = "HTTP"

# #   default_action {
# #     type             = "forward"
# #     target_group_arn = aws_lb_target_group.backend_tg.arn
# #   }
# # }
