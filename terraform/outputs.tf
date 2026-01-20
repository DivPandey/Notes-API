output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.k3s_server.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.k3s_server.public_ip
}

output "app_url" {
  description = "Notes API URL"
  value       = "http://${aws_instance.k3s_server.public_ip}:30000"
}

output "health_check_url" {
  description = "Health check endpoint"
  value       = "http://${aws_instance.k3s_server.public_ip}:30000/api/health"
}

output "api_docs_url" {
  description = "Swagger API documentation"
  value       = "http://${aws_instance.k3s_server.public_ip}:30000/api/docs"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i <your-key.pem> ubuntu@${aws_instance.k3s_server.public_ip}"
}
