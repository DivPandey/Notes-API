terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group
resource "aws_security_group" "k3s_sg" {
  name        = "notes-api-k3s-sg"
  description = "Security group for K3s cluster"

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (for future nginx/ingress)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NodePort for Notes API
  ingress {
    description = "Notes API NodePort"
    from_port   = 30000
    to_port     = 30000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # K3s API (for kubectl from outside if needed)
  ingress {
    description = "K3s API"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "notes-api-k3s-sg"
  }
}

# EC2 Instance with K3s
resource "aws_instance" "k3s_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.k3s_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

echo "=== Starting K3s + Notes API Setup ==="

# Update system
apt-get update -y
apt-get install -y curl wget

# Install K3s
echo "Installing K3s..."
curl -sfL https://get.k3s.io | sh -

# Wait for K3s to be ready
echo "Waiting for K3s to start..."
sleep 30

# Configure kubectl for ubuntu user
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

# Add kubectl to path for ubuntu user
echo 'export KUBECONFIG=/home/ubuntu/.kube/config' >> /home/ubuntu/.bashrc

# Wait for node to be ready
echo "Waiting for node to be ready..."
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl wait --for=condition=Ready node --all --timeout=120s

# Create namespace
kubectl create namespace notes-api || true

# Deploy MongoDB
echo "Deploying MongoDB..."
cat <<'MONGODB_EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: notes-api
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: notes-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: mongodb-data
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: notes-api
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
MONGODB_EOF

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=Available deployment/mongodb -n notes-api --timeout=180s

# Deploy Notes API
echo "Deploying Notes API..."
cat <<'NOTESAPI_EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
  namespace: notes-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notes-api
  template:
    metadata:
      labels:
        app: notes-api
    spec:
      containers:
      - name: notes-api
        image: ${var.dockerhub_username}/notes-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        - name: MONGODB_URI
          value: "mongodb://mongodb.notes-api.svc.cluster.local:27017/notes"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: notes-api
  namespace: notes-api
spec:
  type: NodePort
  selector:
    app: notes-api
  ports:
  - port: 5000
    targetPort: 5000
    nodePort: 30000
NOTESAPI_EOF

# Wait for Notes API to be ready
echo "Waiting for Notes API to be ready..."
kubectl wait --for=condition=Available deployment/notes-api -n notes-api --timeout=180s

# Create helper scripts
echo "Creating helper scripts..."

cat <<'STATUS_EOF' > /home/ubuntu/status.sh
#!/bin/bash
echo "=== K3s Node Status ==="
kubectl get nodes
echo ""
echo "=== Pods ==="
kubectl get pods -n notes-api
echo ""
echo "=== Services ==="
kubectl get svc -n notes-api
echo ""
echo "=== App URL ==="
echo "http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):30000"
STATUS_EOF

cat <<'REDEPLOY_EOF' > /home/ubuntu/redeploy.sh
#!/bin/bash
echo "Redeploying Notes API with latest image..."
kubectl rollout restart deployment/notes-api -n notes-api
kubectl rollout status deployment/notes-api -n notes-api --timeout=120s
echo "Redeployment complete!"
echo "App URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):30000"
REDEPLOY_EOF

cat <<'LOGS_EOF' > /home/ubuntu/logs.sh
#!/bin/bash
kubectl logs -l app=notes-api -n notes-api --tail=100 -f
LOGS_EOF

chmod +x /home/ubuntu/*.sh
chown ubuntu:ubuntu /home/ubuntu/*.sh

echo "=== Setup Complete! ==="
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Notes API URL: http://$PUBLIC_IP:30000"
echo "Health Check: http://$PUBLIC_IP:30000/api/health"
echo "API Docs: http://$PUBLIC_IP:30000/api/docs"
EOF

  tags = {
    Name = "notes-api-k3s"
  }
}
