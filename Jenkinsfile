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

    
    }

    // ================================================================
    // POST ACTIONS
    // ============================================================
 post {
    success {
        echo 'Pipeline succeeded. Sending notification email...'
        emailext (
            to: 'stamilselvansk@gmail.com', // Replace with recipient email address
            subject: "SUCCESSFUL: Job '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
            mimeType: 'text/html',
            body: """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #28a745; color: #ffffff; padding: 20px; text-align: center;">
                            <h2 style="margin: 0; font-size: 22px;">CI/CD Pipeline Succeeded</h2>
                        </div>
                        <div style="padding: 20px; background-color: #ffffff;">
                            <p style="margin-top: 0;"><strong>Job Name:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> #${env.BUILD_NUMBER}</p>
                            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">SUCCESS</span></p>
                            
                            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                            
                            <h3 style="color: #333333; margin-top: 0;">Deployment Summary</h3>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr style="background-color: #f8f9fa;">
                                    <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Frontend Image</td>
                                    <td style="padding: 10px; border: 1px solid #dee2e6; font-family: monospace;">${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Backend Image</td>
                                    <td style="padding: 10px; border: 1px solid #dee2e6; font-family: monospace;">${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}</td>
                                </tr>
                            </table>
                            
                            <p style="margin-bottom: 0;">Amazon ECS deployment finished successfully.</p>
                        </div>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 13px;">
                            <a href="${env.BUILD_URL}" style="color: #007bff; text-decoration: none; font-weight: bold;">View Jenkins Console Logs</a>
                        </div>
                    </div>
                </body>
                </html>
            """
        )
    }

    failure {
        echo 'Pipeline failed. Sending notification email...'
        emailext (
            to: 'stamilselvansk@gmail.com', // Replace with recipient email address
            subject: "FAILED: Job '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
            mimeType: 'text/html',
            body: """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #dc3545; color: #ffffff; padding: 20px; text-align: center;">
                            <h2 style="margin: 0; font-size: 22px;">CI/CD Pipeline Failed</h2>
                        </div>
                        <div style="padding: 20px; background-color: #ffffff;">
                            <p style="margin-top: 0;"><strong>Job Name:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> #${env.BUILD_NUMBER}</p>
                            <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">FAILED</span></p>
                            
                            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                            
                            <p>The build or deployment process encountered an error. Please inspect the console logs to identify and resolve the issue.</p>
                        </div>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 13px;">
                            <a href="${env.BUILD_URL}console" style="color: #dc3545; text-decoration: none; font-weight: bold;">Open Console Output</a>
                        </div>
                    </div>
                </body>
                </html>
            """
        )
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
