# output "aws_elasticache_cluster" {
#   value = aws_elasticache_replication_group.chat_app_redis_cluster.primary_endpoint_address
# }

# output "configuration_endpoint_address" {
#   value = aws_elasticache_replication_group.chat_app_redis_cluster.configuration_endpoint_address
# }

output "backend_server_s3_bucket" {
  value = aws_s3_bucket.backend_server_s3_bucket.id
}

output "server_code_deploy" {
  value = aws_codedeploy_app.server_code_deploy.name
}

output "codedeploy_deployment_group" {
  value = aws_codedeploy_deployment_group.server_code_deploy_group.id
}
