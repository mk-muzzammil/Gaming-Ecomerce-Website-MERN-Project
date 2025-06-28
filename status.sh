#!/bin/bash

echo "🎯 Kubernetes E-commerce App Status"
echo "===================================="
echo ""

# Check if minikube is running
if ! minikube status &>/dev/null; then
    echo "❌ Minikube is not running!"
    echo "   Start with: minikube start --driver=docker --memory=4096 --cpus=2"
    exit 1
fi

echo "✅ Minikube is running"
echo ""

# Show deployments
echo "🚀 DEPLOYMENTS:"
kubectl get deployments -o wide
echo ""

# Show services
echo "🌐 SERVICES:"
kubectl get services -o wide
echo ""

# Show pods
echo "📦 PODS:"
kubectl get pods -o wide
echo ""

# Show HPA
echo "📈 HORIZONTAL POD AUTOSCALER:"
kubectl get hpa
echo ""

# Show PVC
echo "💾 PERSISTENT VOLUME CLAIMS:"
kubectl get pvc
echo ""

# Get application URL
echo "🔗 APPLICATION ACCESS:"
APP_URL=$(minikube service webapp-service --url 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   Web App: $APP_URL"
else
    echo "   Web App: Not available (service may be starting)"
fi

MONGO_URL=$(minikube service mongodb-service --url 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   MongoDB: $MONGO_URL"
else
    echo "   MongoDB: Not available (service may be starting)"
fi
echo ""

# Show resource usage
echo "📊 RESOURCE USAGE:"
kubectl top nodes 2>/dev/null || echo "   Metrics not available (metrics-server may be starting)"
echo ""

# Show recent events
echo "📋 RECENT EVENTS:"
kubectl get events --sort-by=.metadata.creationTimestamp | tail -5
echo ""

echo "🛠️  QUICK COMMANDS:"
echo "   View logs (webapp):    kubectl logs -l app=webapp --tail=20"
echo "   View logs (mongodb):   kubectl logs -l app=mongodb --tail=20"
echo "   Scale webapp:          kubectl scale deployment webapp-deployment --replicas=N"
echo "   Open web app:          minikube service webapp-service"
echo "   Watch HPA:             kubectl get hpa -w"
echo "   Monitor all:           ./monitor.sh"
echo "   Cleanup all:           ./cleanup-k8s.sh"
echo ""

# Check if all deployments are ready
webapp_ready=$(kubectl get deployment webapp-deployment -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
webapp_desired=$(kubectl get deployment webapp-deployment -o jsonpath='{.spec.replicas}' 2>/dev/null)
mongodb_ready=$(kubectl get deployment mongodb-deployment -o jsonpath='{.status.readyReplicas}' 2>/dev/null)

if [[ "$webapp_ready" == "$webapp_desired" && "$mongodb_ready" == "1" ]]; then
    echo "🎉 All deployments are ready!"
else
    echo "⏳ Some deployments are still starting..."
fi 