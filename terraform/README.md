# Terraform - EC2 + K3s Infrastructure

This Terraform configuration provisions an EC2 instance with K3s (lightweight Kubernetes) and deploys the Notes API.

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform installed
3. SSH key pair created in AWS (see below)
4. Docker image pushed to DockerHub

## Create AWS Key Pair (one-time)

1. Go to AWS Console > EC2 > Key Pairs
2. Click "Create key pair"
3. Name: `notes-api-key`
4. Type: RSA, Format: .pem
5. Save the downloaded .pem file securely

## Quick Start

```bash
# 1. Initialize Terraform
terraform init

# 2. Apply with your values
terraform apply \
  -var="key_name=notes-api-key" \
  -var="dockerhub_username=your-dockerhub-username"

# 3. Get the app URL
terraform output app_url
```

## Destroy (cleanup)

```bash
terraform destroy \
  -var="key_name=notes-api-key" \
  -var="dockerhub_username=your-dockerhub-username"
```

## Outputs

After `terraform apply`, you get:
- `app_url` - http://<ip>:30000
- `health_check_url` - http://<ip>:30000/api/health
- `api_docs_url` - http://<ip>:30000/api/docs
- `ssh_command` - SSH command to connect

## Helper Scripts on EC2

```bash
# Check status
./status.sh

# View logs
./logs.sh

# Redeploy (pull latest image)
./redeploy.sh
```

## Cleanup

```bash
terraform destroy
```

## Cost

- t2.medium: ~$0.0464/hour (~$0.23 for 5 hours)
- EBS 20GB: ~$2/month (charged even when stopped)
