# 🚀 Kubernetes Deployment Guide for E-commerce Application

This guide will help you deploy your Node.js Express MongoDB EJS application on Kubernetes using minikube on Ubuntu VM.

## 📋 Prerequisites

Make sure your Ubuntu VM has the following installed:

### 1. Install Docker

```bash
# Update package index
sudo apt update

# Install packages to allow apt to use a repository over HTTPS
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### 2. Install kubectl

```bash
# Download the latest release
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

### 3. Install minikube

```bash
# Download minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

## 🧹 Step 1: Clean Up Existing Deployments

Before deploying, clean up any existing Kubernetes resources:

```bash
# Make cleanup script executable
chmod +x cleanup-k8s.sh

# Run cleanup
./cleanup-k8s.sh
```

## 🎯 Step 2: Start Minikube

```bash
# Start minikube with sufficient resources
minikube start --driver=docker --memory=4096 --cpus=2

# Verify minikube is running
minikube status

# Enable metrics server for HPA
minikube addons enable metrics-server

# Verify kubectl is configured
kubectl cluster-info
```

## 📦 Step 3: Deploy the Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 📊 Step 4: Monitor Deployment

### Option 1: Use the monitoring script

```bash
# Make monitoring script executable
chmod +x monitor.sh

# Run monitoring dashboard
./monitor.sh
```

### Option 2: Manual monitoring commands

```bash
# Check all resources
kubectl get all

# Check pods status
kubectl get pods -w

# Check services
kubectl get svc

# Check HPA status
kubectl get hpa

# Check persistent volumes
kubectl get pv,pvc

# View logs
kubectl logs -l app=webapp
kubectl logs -l app=mongodb
```

## 🌐 Step 5: Access Your Application

### Get the application URL

```bash
# Get the LoadBalancer service URL
minikube service webapp-service --url

# Or use minikube tunnel (in a separate terminal)
minikube tunnel
```

### Access MongoDB (for debugging)

```bash
# Get MongoDB service URL
minikube service mongodb-service --url

# Connect to MongoDB pod directly
kubectl exec -it deployment/mongodb-deployment -- mongosh
```

## 📈 Step 6: Test Auto-scaling

### Generate load to test HPA

```bash
# Get the webapp service URL
export APP_URL=$(minikube service webapp-service --url)

# Generate load using Apache Bench (install if needed)
sudo apt install apache2-utils

# Generate continuous load
for i in {1..1000}; do
  curl -s $APP_URL > /dev/null &
done

# Watch HPA scaling
kubectl get hpa -w
```

## 🔧 Troubleshooting

### Check pod logs

```bash
# Check webapp logs
kubectl logs -l app=webapp --tail=50

# Check MongoDB logs
kubectl logs -l app=mongodb --tail=50

# Describe pods for detailed status
kubectl describe pods
```

### Common Issues and Solutions

1. **Pods stuck in Pending state**

   ```bash
   # Check node resources
   kubectl top nodes
   kubectl describe nodes
   ```

2. **ImagePullBackOff error**

   ```bash
   # Verify image exists in minikube
   minikube image ls | grep ecommerce-app

   # Rebuild and reload image
   docker build -f Dockerfile.k8s -t ecommerce-app:latest .
   minikube image load ecommerce-app:latest
   ```

3. **MongoDB connection issues**

   ```bash
   # Check MongoDB service
   kubectl get svc mongodb-service

   # Test connection from webapp pod
   kubectl exec -it deployment/webapp-deployment -- nc -zv mongodb-service 27017
   ```

4. **HPA not scaling**

   ```bash
   # Check metrics server
   kubectl top pods
   kubectl top nodes

   # Check HPA conditions
   kubectl describe hpa webapp-hpa
   ```

## 🛠 Useful Commands

### Scale deployments manually

```bash
# Scale webapp deployment
kubectl scale deployment webapp-deployment --replicas=5

# Scale down
kubectl scale deployment webapp-deployment --replicas=2
```

### Update deployments

```bash
# Update webapp image
kubectl set image deployment/webapp-deployment webapp=ecommerce-app:v2

# Check rollout status
kubectl rollout status deployment/webapp-deployment

# Rollback if needed
kubectl rollout undo deployment/webapp-deployment
```

### Port forwarding (alternative access method)

```bash
# Forward webapp port
kubectl port-forward service/webapp-service 8080:80

# Forward MongoDB port
kubectl port-forward service/mongodb-service 27017:27017
```

## 🗑️ Cleanup Commands

### Remove specific deployments

```bash
# Delete all application resources
kubectl delete -f k8s/

# Delete specific resources
kubectl delete deployment webapp-deployment
kubectl delete deployment mongodb-deployment
kubectl delete service webapp-service
kubectl delete service mongodb-service
kubectl delete pvc mongodb-pvc
kubectl delete hpa webapp-hpa
```

### Stop minikube

```bash
# Stop minikube
minikube stop

# Delete minikube cluster
minikube delete
```

## 📁 File Structure

Your project should have this structure after setup:

```
project/
├── app.js                      # Original app
├── app-k8s.js                  # Kubernetes version
├── Dockerfile                  # Original Dockerfile
├── Dockerfile.k8s              # Kubernetes Dockerfile
├── cleanup-k8s.sh             # Cleanup script
├── deploy.sh                  # Deployment script
├── monitor.sh                 # Monitoring script
├── k8s/
│   ├── mongodb-pvc.yaml       # MongoDB Persistent Volume Claim
│   ├── mongodb-deployment.yaml # MongoDB Deployment
│   ├── mongodb-service.yaml   # MongoDB Service
│   ├── webapp-deployment.yaml # Webapp Deployment
│   ├── webapp-service.yaml    # Webapp Service
│   └── webapp-hpa.yaml        # Horizontal Pod Autoscaler
└── other project files...
```

## ✅ Verification Checklist

- [ ] Minikube is running
- [ ] MongoDB deployment is available
- [ ] MongoDB PVC is bound
- [ ] Webapp deployment is available
- [ ] All services are running
- [ ] HPA is configured and functional
- [ ] Application is accessible via LoadBalancer
- [ ] Auto-scaling works under load

## 🎉 Success!

If all steps are completed successfully, you should have:

- ✅ Multiple webapp replicas running
- ✅ Single MongoDB instance with persistent storage
- ✅ LoadBalancer service for webapp
- ✅ NodePort service for MongoDB
- ✅ Horizontal Pod Autoscaler for webapp
- ✅ Full application functionality

Your e-commerce application is now running on Kubernetes! 🎊
