pipeline {
    agent any
    
    stages {
        stage('Checkout SCM') {
            steps {
                git url: 'https://github.com/mk-muzzammil/Gaming-Ecomerce-Website-MERN-Project.git', branch: 'master'
            }
        }
        
        stage('Verify .env file') {
            steps {
                script {
                    // Check if .env file exists and display its contents (without sensitive data)
                    sh '''
                        if [ -f .env ]; then
                            echo "✅ .env file found in repository"
                            echo "📄 .env file size: $(wc -c < .env) bytes"
                            echo "📋 .env file contains $(wc -l < .env) lines"
                        else
                            echo "❌ .env file not found in repository root"
                            echo "📁 Files in current directory:"
                            ls -la
                            exit 1
                        fi
                    '''
                }
            }
        }
        
        stage('Clean up CI container') {
            steps {
                // Remove only the CI container, not production
                sh '''
                    docker rm -f ecommerce-app-ci || true
                '''
            }
        }
        
        stage('Build & Run CI Container') {
            steps {
                sh 'docker-compose -p ecommerce_pipeline -f docker-compose.ci.yml up -d --build'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo '✅ Build completed successfully!'
        }
        failure {
            echo '❌ Build failed. Check logs for details.'
        }
    }
}
