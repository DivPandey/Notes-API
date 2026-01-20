variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID for ap-south-1"
  type        = string
  default     = "ami-0f5ee92e2d63afc18"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.medium"
}

variable "key_name" {
  description = "Name of the SSH key pair (must exist in AWS)"
  type        = string
  # No default - must be provided via -var
}

variable "dockerhub_username" {
  description = "DockerHub username for pulling the notes-api image"
  type        = string
  default     = "divpandey"
}

