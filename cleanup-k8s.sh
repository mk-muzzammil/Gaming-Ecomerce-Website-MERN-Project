#!/bin/bash

echo "🧹 Cleaning up existing Kubernetes resources..."

# Delete all deployments
kubectl delete deployments --all --all-namespaces

# Delete all services (except kubernetes service)
kubectl delete services --all --all-namespaces --ignore-not-found=true

# Delete all pods
kubectl delete pods --all --all-namespaces --force --grace-period=0

# Delete all replicasets
kubectl delete replicasets --all --all-namespaces

# Delete all configmaps
kubectl delete configmaps --all --all-namespaces

# Delete all secrets (except default ones)
kubectl delete secrets --all --all-namespaces --ignore-not-found=true

# Delete all persistent volume claims
kubectl delete pvc --all --all-namespaces

# Delete all persistent volumes
kubectl delete pv --all

# Delete all horizontal pod autoscalers
kubectl delete hpa --all --all-namespaces

# Delete all ingresses
kubectl delete ingress --all --all-namespaces

# Wait for cleanup to complete
echo "⏳ Waiting for cleanup to complete..."
sleep 10

# Show remaining resources
echo "📋 Remaining resources:"
kubectl get all --all-namespaces

echo "✅ Cleanup completed!" 