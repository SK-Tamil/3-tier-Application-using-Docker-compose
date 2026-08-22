pipeline {
    agent any

    environment {
        AWS_REGION     = 'us-east-1'
        AWS_ACCOUNT_ID = '165328639795'

        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        FRONTEND_REPO  = 'employee-frontend'
        BACKEND_REPO   = 'employee-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out dev branch...'
                checkout scm
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

        stage('Login to AWS ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                        --region ${AWS_REGION} | \
                    docker login \
                        --username AWS \
                        --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Tag Docker Images') {
    steps {
        sh '''
            docker tag \
                employee-frontend:latest \
                ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

            docker tag \
                employee-backend:latest \
                ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}
        '''
    }
}     

       stage('Push Images to ECR') {
    steps {
        sh '''
            echo "Pushing frontend image..."
            docker push \
                ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

            echo "Pushing backend image..."
            docker push \
                ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}
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
