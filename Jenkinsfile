pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'

        ECR_FRONTEND = 'employee-frontend'
        ECR_BACKEND  = 'employee-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out dev branch...'
                checkout scm
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "Current branch:"
                    git branch --show-current

                    echo "Project files:"
                    ls -la
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build \
                        -t employee-frontend:latest \
                        ./frontend
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                        -t employee-backend:latest \
                        ./backend
                '''
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }

        failure {
            echo 'CI pipeline failed!'
        }
    }
}

