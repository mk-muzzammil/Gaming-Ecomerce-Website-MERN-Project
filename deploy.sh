#!/bin/bash

set -e

echo "🚀 Starting Kubernetes deployment..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.k8s -t ecommerce-app:latest .

# Load image into minikube (if using minikube)
echo "📥 Loading image into minikube..."
minikube image load ecommerce-app:latest

# Apply Kubernetes manifests in order
echo "📋 Applying Kubernetes manifests..."

# 1. Apply PVC first
kubectl apply -f k8s/mongodb-pvc.yaml

# 2. Apply MongoDB deployment and service
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb-deployment

# 3. Apply webapp deployment and service
kubectl apply -f k8s/webapp-deployment.yaml
kubectl apply -f k8s/webapp-service.yaml

# Wait for webapp to be ready
echo "⏳ Waiting for webapp to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/webapp-deployment

# 4. Apply HPA
kubectl apply -f k8s/webapp-hpa.yaml

echo "✅ Deployment completed!"
echo ""
echo "📊 Current status:"
kubectl get all
echo ""
echo "🌐 To access the application:"
echo "   minikube service webapp-service"
echo ""
echo "📈 To check HPA status:"
echo "   kubectl get hpa"
echo ""
echo "📋 To check logs:"
echo "   kubectl logs -l app=webapp"
echo "   kubectl logs -l app=mongodb" 