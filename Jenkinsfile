pipeline {
    agent any

    environment {
        CLOUDINARY_CLOUD_NAME = credentials('CLOUDINARY_CLOUD_NAME')
        CLOUDINARY_API_KEY = credentials('CLOUDINARY_API_KEY')
        CLOUDINARY_API_SECRET = credentials('CLOUDINARY_API_SECRET')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git url: 'https://github.com/thatisawais/gaming-store.git', branch: 'master'
            }
        }

        stage('Create .env file') {
            steps {
                script {
                    sh '''
                        cat > .env << EOF
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
EOF
                    '''
                }
            }
        }

        stage('Clean up CI container') {
            steps {
                // Remove only the CI container, not production (Part-I)
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
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Check logs for details.'
        }
    }
}