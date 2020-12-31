output "aws_elasticache_cluster" {
  value = aws_elasticache_replication_group.chat_app_redis_cluster.primary_endpoint_address
}
