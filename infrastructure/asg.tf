# # resource "aws_autoscaling_group" "ec2_public_autoscaling_group" {
# #   name                      = "${local.prefix}-ASG"
# #   vpc_zone_identifier       = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
# #   max_size                  = 2
# #   min_size                  = 1
# #   desired_capacity          = 1
# #   launch_configuration      = aws_launch_configuration.ec2_public_launch_configuration.name
# #   health_check_type         = "ELB"
# #   default_cooldown          = 30
# #   health_check_grace_period = 30
# #   load_balancers            = [aws_lb.server_load_balancer.name]
# #   target_group_arns         = [aws_lb_target_group.backend_tg.arn]

# #   # Required to redeploy without an outage.
# #   lifecycle {
# #     create_before_destroy = true
# #   }

# #   tag {
# #     key                 = "Name"
# #     propagate_at_launch = false
# #     value               = "Backend-EC2-Instance"
# #   }

# #   tag {
# #     key                 = "Type"
# #     propagate_at_launch = false
# #     value               = "Backend"
# #   }
# # }

# resource "aws_autoscaling_policy" "backend_production_scaling_policy" {
#   autoscaling_group_name   = aws_autoscaling_group.ec2_public_autoscaling_group.name
#   name                     = "Production-Backend-AutoScaling-Policy"
#   policy_type              = "TargetTrackingScaling"
#   min_adjustment_magnitude = 1

#   target_tracking_configuration {
#     predefined_metric_specification {
#       predefined_metric_type = "ASGAverageCPUUtilization"
#     }
#     target_value = 80.0
#   }
# }

# resource "aws_autoscaling_group" "ec2_public_autoscaling_group" {
#   name                      = "Production-WebApp-AutoScalingGroup"
#   vpc_zone_identifier       = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_a.id]
#   max_size                  = 2
#   min_size                  = 1
#   desired_capacity          = 1
#   launch_configuration      = aws_launch_configuration.ec2_public_launch_configuration.name
#   health_check_type         = "ELB"
#   default_cooldown          = 30
#   health_check_grace_period = 30
#   load_balancers            = [aws_lb.server_load_balancer.name]

#   tag {
#     key                 = "Name"
#     propagate_at_launch = false
#     value               = "WebApp-EC2-Instance"
#   }

#   tag {
#     key                 = "Type"
#     propagate_at_launch = false
#     value               = "WebApp"
#   }
# }

# resource "aws_autoscaling_policy" "webapp_production_scaling_policy" {
#   autoscaling_group_name   = aws_autoscaling_group.ec2_public_autoscaling_group.name
#   name                     = "Production-WebApp-AutoScaling-Policy"
#   policy_type              = "TargetTrackingScaling"
#   min_adjustment_magnitude = 1

#   target_tracking_configuration {
#     predefined_metric_specification {
#       predefined_metric_type = "ASGAverageCPUUtilization"
#     }
#     target_value = 80.0
#   }
# }
