output "aws_elasticache_cluster" {
  value = aws_elasticache_replication_group.chat_app_redis_cluster.primary_endpoint_address
}

output "configuration_endpoint_address" {
  value = aws_elasticache_replication_group.chat_app_redis_cluster.configuration_endpoint_address
}
