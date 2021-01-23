# resource "aws_elasticache_subnet_group" "elasticache_subnet" {
#   name       = "${local.prefix}-subnet-elasticache"
#   subnet_ids = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
# }

# # resource "aws_elasticache_cluster" "chat_app_redis_cluster" {
# #   cluster_id           = "${local.prefix}-redis"
# #   engine               = "redis"
# #   node_type            = "cache.t2.micro"
# #   num_cache_nodes      = 1
# #   parameter_group_name = "default.redis6.x"
# #   engine_version       = "6.x"
# #   port                 = 6379
# #   subnet_group_name    = aws_elasticache_subnet_group.subnet_group_elasticache.name
# #   security_group_ids   = [aws_security_group.sg_elasticache_cluster.id]

# # depends_on = [
# #   aws_security_group.sg_elasticache_cluster,
# # ]
# # }

# resource "aws_elasticache_replication_group" "chat_app_redis_cluster" {
#   automatic_failover_enabled    = true
#   replication_group_id          = "redis-replication-group"
#   replication_group_description = "redis elasticache replication group"
#   node_type                     = "cache.t2.micro"
#   number_cache_clusters         = 2
#   engine_version                = "6.x"
#   parameter_group_name          = "default.redis6.x"
#   port                          = 6379
#   subnet_group_name             = aws_elasticache_subnet_group.elasticache_subnet.name
#   security_group_ids            = [aws_security_group.sg_elasticache_cluster.id]

#   depends_on = [
#     aws_security_group.sg_elasticache_cluster,
#   ]
#   tags = {
#     Name      = "DFSC Elasticache Replication Group"
#     Terraform = "true"
#   }
# }
