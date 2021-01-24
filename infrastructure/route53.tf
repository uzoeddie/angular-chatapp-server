# This data source looks up the public DNS zone
data "aws_route53_zone" "public" {
  name         = "sbx-oduz01-20200305.sbx.sms-digital.cloud"
  private_zone = false
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "sbx-oduz01-20200305.sbx.sms-digital.cloud"
  validation_method = "DNS"

  tags = {
    Environment = "ng-chatapp"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# This is a DNS record for the ACM certificate validation to prove we own the domain
# This example, we make an assumption that the certificate is for a single domain name so we can just
# use the first value of the domain_validation_options.
resource "aws_route53_record" "cert_validation_record" {
  allow_overwrite = true
  name            = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
  records         = [tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value]
  type            = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
  zone_id         = data.aws_route53_zone.public.id
  ttl             = 60
}

# Certificate validation
resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation_record.fqdn]
}

# Standard route53 DNS record pointing to an ALB
# When ASG is available, rethink using simple routing
resource "aws_route53_record" "alb_dns_record" {
  zone_id = data.aws_route53_zone.public.zone_id
  name    = "sbx-oduz01-20200305.sbx.sms-digital.cloud"
  type    = "A"
  alias {
    name                   = aws_alb.server_load_balancer.dns_name
    zone_id                = aws_alb.server_load_balancer.zone_id
    evaluate_target_health = false
  }
}
