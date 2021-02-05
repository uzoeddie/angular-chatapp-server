resource "aws_codedeploy_app" "server_code_deploy" {
  compute_platform = "Server"
  name             = "${local.prefix}-app"
}

# This is for in-place deployment
# resource "aws_codedeploy_deployment_group" "server_code_deploy_group" {
#   app_name               = aws_codedeploy_app.server_code_deploy.name
#   deployment_group_name  = "${local.prefix}-group"
#   deployment_config_name = "CodeDeployDefault.OneAtATime"
#   service_role_arn       = aws_iam_role.ec2_iam_role.arn

#   auto_rollback_configuration {
#     enabled = true
#     events  = ["DEPLOYMENT_FAILURE"]
#   }

#   alarm_configuration {
#     alarms  = ["app-deployment"]
#     enabled = true
#   }

#   ec2_tag_set {
#     ec2_tag_filter {
#       key   = "Name"
#       type  = "KEY_AND_VALUE"
#       value = "${local.prefix}-public-ec2"
#     }
#   }
# }

# Blue/green deployment
resource "aws_codedeploy_deployment_group" "server_code_deploy_group" {
  app_name               = aws_codedeploy_app.server_code_deploy.name
  deployment_group_name  = "${local.prefix}-group"
  deployment_config_name = "CodeDeployDefault.OneAtATime"
  service_role_arn       = aws_iam_role.ec2_iam_role.arn
  autoscaling_groups     = [aws_autoscaling_group.ec2_public_autoscaling_group.name]

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  load_balancer_info {
    target_group_info {
      name = aws_alb_target_group.server_backend_tg.name
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    green_fleet_provisioning_option {
      action = "COPY_AUTO_SCALING_GROUP"
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }
}
