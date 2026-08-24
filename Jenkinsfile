pipeline {
    agent any

    environment {
        
        AWS_REGION     = 'us-east-1'
        AWS_ACCOUNT_ID = '165328639795'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

   
        FRONTEND_REPO = 'employee-frontend'
        BACKEND_REPO  = 'employee-backend'

        

        ECS_CLUSTER = 'employee-management-cluster'

        FRONTEND_SERVICE = 'employee-frontend-task-services'
        BACKEND_SERVICE  = 'employee-backend-task-service'

        // Container names inside ECS task definitions
        FRONTEND_CONTAINER = 'frontend'
        BACKEND_CONTAINER  = 'backend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        
        stage('Build Frontend Image') {
            steps {
                sh '''
                    set -e

                    echo "Building frontend Docker image..."

                    docker build \
                        -t employee-frontend:${BUILD_NUMBER} \
                        ./frontend
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    set -e

                    echo "Building backend Docker image..."

                    docker build \
                        -t employee-backend:${BUILD_NUMBER} \
                        ./backend
                '''
            }
        }

        
        stage('Login to AWS ECR') {
            steps {
                sh '''
                    set -e

                    echo "Logging into AWS ECR..."

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
                    set -e

                    echo "Tagging frontend image..."

                    docker tag \
                        employee-frontend:${BUILD_NUMBER} \
                        ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                    echo "Tagging backend image..."

                    docker tag \
                        employee-backend:${BUILD_NUMBER} \
                        ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}
                '''
            }
        }

     
        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "Pushing frontend image"
                    echo "======================================"

                    docker push \
                        ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                    echo "======================================"
                    echo "Pushing backend image"
                    echo "======================================"

                    docker push \
                        ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

                    echo "Images pushed successfully."
                '''
            }
        }

       
        stage('Deploy Backend to ECS') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "Deploying Backend"
                    echo "======================================"

                    echo "Getting current backend task definition..."

                    CURRENT_BACKEND_TASK_DEFINITION=$(aws ecs describe-services \
                        --cluster ${ECS_CLUSTER} \
                        --services ${BACKEND_SERVICE} \
                        --region ${AWS_REGION} \
                        --query 'services[0].taskDefinition' \
                        --output text)

                    echo "Current backend task definition:"
                    echo "${CURRENT_BACKEND_TASK_DEFINITION}"

                    echo "Downloading current task definition..."

                    aws ecs describe-task-definition \
                        --task-definition ${CURRENT_BACKEND_TASK_DEFINITION} \
                        --region ${AWS_REGION} \
                        --query 'taskDefinition' \
                        --output json \
                        > backend-task-definition.json

                    echo "Updating backend Docker image..."

                    jq --arg IMAGE \
                        "${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}" \
                        --arg CONTAINER \
                        "${BACKEND_CONTAINER}" \
                        '
                        .containerDefinitions |=
                        map(
                            if .name == $CONTAINER
                            then .image = $IMAGE
                            else .
                            end
                        )
                        |
                        del(
                            .taskDefinitionArn,
                            .revision,
                            .status,
                            .requiresAttributes,
                            .compatibilities,
                            .registeredAt,
                            .registeredBy
                        )
                        ' \
                        backend-task-definition.json \
                        > backend-task-definition-new.json

                    echo "Registering new backend task definition..."

                    NEW_BACKEND_TASK_DEFINITION=$(aws ecs register-task-definition \
                        --cli-input-json file://backend-task-definition-new.json \
                        --region ${AWS_REGION} \
                        --query 'taskDefinition.taskDefinitionArn' \
                        --output text)

                    echo "New backend task definition:"
                    echo "${NEW_BACKEND_TASK_DEFINITION}"

                    echo "Updating backend ECS service..."

                    aws ecs update-service \
                        --cluster ${ECS_CLUSTER} \
                        --service ${BACKEND_SERVICE} \
                        --task-definition ${NEW_BACKEND_TASK_DEFINITION} \
                        --region ${AWS_REGION}

                    echo "Backend deployment started."
                '''
            }
        }

        // ============================================================
        // 8. WAIT FOR BACKEND
        // ============================================================
        stage('Wait for Backend Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Waiting for backend ECS service to become stable..."

                    aws ecs wait services-stable \
                        --cluster ${ECS_CLUSTER} \
                        --services ${BACKEND_SERVICE} \
                        --region ${AWS_REGION}

                    echo "Backend deployment completed successfully."
                '''
            }
        }

        // ============================================================
        // 9. DEPLOY FRONTEND
        // ============================================================
        stage('Deploy Frontend to ECS') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "Deploying Frontend"
                    echo "======================================"

                    echo "Getting current frontend task definition..."

                    CURRENT_FRONTEND_TASK_DEFINITION=$(aws ecs describe-services \
                        --cluster ${ECS_CLUSTER} \
                        --services ${FRONTEND_SERVICE} \
                        --region ${AWS_REGION} \
                        --query 'services[0].taskDefinition' \
                        --output text)

                    echo "Current frontend task definition:"
                    echo "${CURRENT_FRONTEND_TASK_DEFINITION}"

                    echo "Downloading current task definition..."

                    aws ecs describe-task-definition \
                        --task-definition ${CURRENT_FRONTEND_TASK_DEFINITION} \
                        --region ${AWS_REGION} \
                        --query 'taskDefinition' \
                        --output json \
                        > frontend-task-definition.json

                    echo "Updating frontend Docker image..."

                    jq --arg IMAGE \
                        "${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}" \
                        --arg CONTAINER \
                        "${FRONTEND_CONTAINER}" \
                        '
                        .containerDefinitions |=
                        map(
                            if .name == $CONTAINER
                            then .image = $IMAGE
                            else .
                            end
                        )
                        |
                        del(
                            .taskDefinitionArn,
                            .revision,
                            .status,
                            .requiresAttributes,
                            .compatibilities,
                            .registeredAt,
                            .registeredBy
                        )
                        ' \
                        frontend-task-definition.json \
                        > frontend-task-definition-new.json

                    echo "Registering new frontend task definition..."

                    NEW_FRONTEND_TASK_DEFINITION=$(aws ecs register-task-definition \
                        --cli-input-json file://frontend-task-definition-new.json \
                        --region ${AWS_REGION} \
                        --query 'taskDefinition.taskDefinitionArn' \
                        --output text)

                    echo "New frontend task definition:"
                    echo "${NEW_FRONTEND_TASK_DEFINITION}"

                    echo "Updating frontend ECS service..."

                    aws ecs update-service \
                        --cluster ${ECS_CLUSTER} \
                        --service ${FRONTEND_SERVICE} \
                        --task-definition ${NEW_FRONTEND_TASK_DEFINITION} \
                        --region ${AWS_REGION}

                    echo "Frontend deployment started."
                '''
            }
        }

        // ============================================================
        // 10. WAIT FOR FRONTEND
        // ============================================================
        stage('Wait for Frontend Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Waiting for frontend ECS service to become stable..."

                    aws ecs wait services-stable \
                        --cluster ${ECS_CLUSTER} \
                        --services ${FRONTEND_SERVICE} \
                        --region ${AWS_REGION}

                    echo "Frontend deployment completed successfully."
                '''
            }
        }
    }

    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {

        success {
            echo '''
========================================
CI/CD PIPELINE SUCCESS
========================================
Frontend image:
${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

Backend image:
${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

ECS deployment completed successfully.
========================================
'''
        }

        failure {
            echo '''
========================================
CI/CD PIPELINE FAILED
========================================
Check the Jenkins console output.
========================================
'''
        }

        always {
            sh '''
                echo "Cleaning local Docker images..."

                docker image rm \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER} \
                    2>/dev/null || true

                docker image rm \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER} \
                    2>/dev/null || true

                docker image rm \
                    employee-frontend:${BUILD_NUMBER} \
                    2>/dev/null || true

                docker image rm \
                    employee-backend:${BUILD_NUMBER} \
                    2>/dev/null || true

                rm -f backend-task-definition.json
                rm -f backend-task-definition-new.json
                rm -f frontend-task-definition.json
                rm -f frontend-task-definition-new.json

                echo "Cleanup completed."
            '''
        }
    }
}
