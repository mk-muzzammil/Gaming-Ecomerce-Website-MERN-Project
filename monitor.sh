#!/bin/bash

echo "📊 Kubernetes Deployment Monitoring Dashboard"
echo "=============================================="

while true; do
    clear
    echo "📊 Kubernetes Deployment Monitoring Dashboard"
    echo "=============================================="
    echo "🕐 Last updated: $(date)"
    echo ""
    
    echo "🏠 NAMESPACES:"
    kubectl get namespaces
    echo ""
    
    echo "📦 PODS:"
    kubectl get pods -o wide
    echo ""
    
    echo "🚀 DEPLOYMENTS:"
    kubectl get deployments
    echo ""
    
    echo "🌐 SERVICES:"
    kubectl get services
    echo ""
    
    echo "💾 PERSISTENT VOLUME CLAIMS:"
    kubectl get pvc
    echo ""
    
    echo "📈 HORIZONTAL POD AUTOSCALER:"
    kubectl get hpa
    echo ""
    
    echo "🔄 REPLICASETS:"
    kubectl get rs
    echo ""
    
    echo "💻 NODE INFORMATION:"
    kubectl get nodes
    echo ""
    
    echo "🔍 EVENTS (Last 10):"
    kubectl get events --sort-by=.metadata.creationTimestamp | tail -10
    echo ""
    
    echo "Press Ctrl+C to exit..."
    sleep 5
done 