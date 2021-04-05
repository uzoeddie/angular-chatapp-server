resource "aws_launch_configuration" "ec2_public_launch_configuration" {
  name_prefix                 = "server-"
  image_id                    = "ami-0a6dc7529cd559185"
  instance_type               = "t2.micro"
  key_name                    = var.ec2_key_pair
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name
  security_groups             = [aws_security_group.ec2_public_security_group.id]
  user_data                   = file("./userdata/user-data.sh")
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "ec2_public_autoscaling_group" {
  name = "${local.prefix}-ASG"
  vpc_zone_identifier = [
    aws_subnet.public_subnet_a.id,
    aws_subnet.public_subnet_b.id,
    aws_subnet.public_subnet_c.id
  ]
  max_size                  = 4
  min_size                  = 1
  desired_capacity          = 1
  launch_configuration      = aws_launch_configuration.ec2_public_launch_configuration.name
  health_check_type         = "ELB"
  health_check_grace_period = 800
  default_cooldown          = 150
  force_delete              = true
  target_group_arns         = [aws_alb_target_group.server_backend_tg.arn]
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  # Required to redeploy without an outage.
  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    propagate_at_launch = true
    value               = "Backend-EC2-Instance"
  }

  tag {
    key                 = "Type"
    propagate_at_launch = true
    value               = "Backend"
  }
}

# scale up alarm
resource "aws_autoscaling_policy" "backend_scaleup_policy" {
  name                   = "Backend-Scaleup-Policy"
  autoscaling_group_name = aws_autoscaling_group.ec2_public_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = 1
  cooldown               = 150
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_up_alarm" {
  alarm_name          = "ec2-scale-up"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_public_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.backend_scaleup_policy.arn]
}

# scale down alarm
resource "aws_autoscaling_policy" "backend_scaledown_policy" {
  name                   = "Backend-Scaledown-Policy"
  autoscaling_group_name = aws_autoscaling_group.ec2_public_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = -1
  cooldown               = 150
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_down_alarm" {
  alarm_name          = "ec2-scale-down"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 10

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_public_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.backend_scaledown_policy.arn]
}
