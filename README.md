# Employee Management Application — DevOps CI/CD Project

A complete **three-tier Employee Management application** containerized with Docker, tested locally using Docker Compose, and automatically deployed to **AWS ECS** using a **Jenkins CI/CD pipeline**.

The project demonstrates the complete DevOps workflow from source-code management to automated cloud deployment.

---

## 📌 Project Overview

This project implements an Employee Management web application using a three-tier architecture:

* **Frontend:** React + Nginx
* **Backend:** Python Flask REST API
* **Database:** MySQL
* **Containerization:** Docker
* **Local Orchestration:** Docker Compose
* **Source Control:** Git / GitHub
* **CI/CD:** Jenkins
* **Container Registry:** Amazon ECR
* **Container Platform:** Amazon ECS
* **Database Hosting:** Amazon RDS MySQL

### DevOps Workflow

```text
Developer
    |
    v
GitHub Repository
    |
    v
Jenkins
    |
    +-----------------------+
    |                       |
    v                       v
Build Frontend         Build Backend
Docker Image           Docker Image
    |                       |
    +-----------+-----------+
                |
                v
          Amazon ECR
                |
                v
          Amazon ECS
        /             \
       v               v
Frontend Service   Backend Service
                       |
                       v
                 Amazon RDS
                    MySQL
```

---

# 🏗️ Architecture

The application follows a three-tier architecture.

```text
                    USER
                     |
                     v
              +-------------+
              |   Browser   |
              +-------------+
                     |
                     v
        +-------------------------+
        | Frontend - React/Nginx  |
        |      ECS Service        |
        +-------------------------+
                     |
                     | REST API
                     v
        +-------------------------+
        |   Backend - Flask      |
        |      ECS Service       |
        +-------------------------+
                     |
                     | MySQL
                     v
        +-------------------------+
        |   Amazon RDS MySQL     |
        |       Database         |
        +-------------------------+
```

---

# 🛠️ Technology Stack

| Category            | Technology     |
| ------------------- | -------------- |
| Frontend            | React          |
| Web Server          | Nginx          |
| Backend             | Python Flask   |
| Database            | MySQL          |
| Containerization    | Docker         |
| Local Orchestration | Docker Compose |
| Source Control      | Git / GitHub   |
| CI/CD               | Jenkins        |
| Container Registry  | Amazon ECR     |
| Container Platform  | Amazon ECS     |
| Database Hosting    | Amazon RDS     |
| Cloud Provider      | AWS            |
| AWS Region          | `us-east-1`    |

---

# 📁 Project Structure

```text
employee-management/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

> The exact files may vary depending on the final application source code.

---

# 🐳 Docker Containerization

Both frontend and backend applications are containerized separately.

## Frontend Container

The frontend application is built using React and served using Nginx.

The frontend Docker image contains:

* React application
* Production build
* Nginx web server
* Nginx configuration

Example build command:

```bash
docker build -t employee-frontend ./frontend
```

---

## Backend Container

The backend is a Python Flask REST API.

The backend container contains:

* Python runtime
* Flask application
* Required Python dependencies
* Application configuration

Example build command:

```bash
docker build -t employee-backend ./backend
```

---

# 🐙 Docker Compose

Docker Compose is used to run the multi-container application locally.

The local environment contains the application services required for testing.

### Start Application

```bash
docker compose up -d
```

### Check Running Containers

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs
```

### Stop Application

```bash
docker compose down
```

### Local Application Flow

```text
Browser
   |
   v
Frontend Container
   |
   v
Backend Container
   |
   v
MySQL Database
```

Docker Compose allows the complete application to be tested locally before deploying it to AWS.

---

# 🔀 Git and GitHub

Git is used for source-code management.

The repository contains:

* Frontend source code
* Backend source code
* Dockerfiles
* Docker Compose configuration
* Jenkins pipeline
* Project documentation

Typical Git workflow:

```bash
git clone <repository-url>

git add .

git commit -m "Update application"

git push origin main
```

---

# 🔄 CI/CD Pipeline

Jenkins automates the complete build and deployment process.

## Pipeline Stages

```text
Checkout
   |
   v
Build Frontend Image
   |
   v
Build Backend Image
   |
   v
Login to Amazon ECR
   |
   v
Tag Docker Images
   |
   v
Push Images to ECR
   |
   v
Deploy Backend to ECS
   |
   v
Deploy Frontend to ECS
   |
   v
Email Notification
   |
   v
Cleanup
```

---

# 🔧 Jenkins Pipeline

The project uses a Jenkins Declarative Pipeline.

### Pipeline Stages

| Stage                  | Description                              |
| ---------------------- | ---------------------------------------- |
| Checkout               | Retrieves source code from Git           |
| Build Frontend Image   | Builds React/Nginx Docker image          |
| Build Backend Image    | Builds Flask Docker image                |
| Login to AWS ECR       | Authenticates Docker with ECR            |
| Tag Docker Images      | Adds ECR repository and build number     |
| Push Images to ECR     | Uploads images to ECR                    |
| Deploy Backend to ECS  | Updates backend ECS task definition      |
| Deploy Frontend to ECS | Updates frontend ECS task definition     |
| Notification           | Sends success/failure email              |
| Cleanup                | Removes temporary files and local images |

---

# ☁️ Amazon ECR

Amazon Elastic Container Registry (ECR) is used to store Docker images.

Two ECR repositories are used:

```text
employee-frontend
employee-backend
```

Images are tagged using the Jenkins build number.

Example:

```text
<account-id>.dkr.ecr.us-east-1.amazonaws.com/employee-frontend:10

<account-id>.dkr.ecr.us-east-1.amazonaws.com/employee-backend:10
```

Using the Jenkins build number provides a unique image version for every pipeline execution.

---

# 🚀 Amazon ECS Deployment

Amazon Elastic Container Service (ECS) is used to run the Docker containers in AWS.

## ECS Cluster

```text
employee-management-cluster
```

## ECS Services

### Frontend

```text
employee-frontend-task-services
```

Container:

```text
frontend
```

### Backend

```text
employee-backend-task-service
```

Container:

```text
backend
```

---

# 🔁 ECS Deployment Process

Jenkins automatically performs the following operations.

### 1. Get Current Task Definition

Jenkins retrieves the task definition currently used by the ECS service.

```bash
aws ecs describe-services
```

### 2. Download Task Definition

```bash
aws ecs describe-task-definition
```

### 3. Update Docker Image

`jq` is used to replace the existing container image with the new ECR image.

```text
Old Image
    |
    v
Current ECS Task Definition
    |
    v
Replace Container Image
    |
    v
New ECR Image
```

### 4. Register New Task Definition

```bash
aws ecs register-task-definition
```

### 5. Update ECS Service

```bash
aws ecs update-service
```

This causes ECS to deploy the new task-definition revision.

---

# 🗄️ Amazon RDS MySQL

Amazon RDS MySQL is used as the application's managed database.

The backend communicates with the RDS database.

```text
Flask Backend
      |
      | MySQL Connection
      v
Amazon RDS
      |
      v
MySQL Database
```

Using Amazon RDS provides managed database infrastructure instead of running the production database directly inside an application container.

---

# 🔐 Security

Security considerations implemented or planned in the project include:

* AWS IAM permissions
* ECR access permissions
* ECS permissions
* Security Groups
* Database network restrictions
* Environment variables for configuration
* Avoiding hardcoded database credentials
* Least-privilege IAM permissions

Sensitive information such as:

```text
AWS Access Keys
AWS Secret Keys
Database Passwords
API Secrets
```

should **never be committed to GitHub**.

Use Jenkins credentials, AWS IAM roles, environment variables, or AWS Secrets Manager for sensitive configuration.

---

# 🧪 Testing

Testing was performed at multiple stages.

## Local Testing

The application was tested using Docker Compose.

Validation included:

* Frontend container running
* Backend container running
* API communication
* Database connectivity
* Container-to-container communication

## CI/CD Testing

Jenkins validates:

* Git checkout
* Docker image builds
* ECR authentication
* Docker image push
* ECS task-definition registration
* ECS service update

## AWS Testing

After deployment:

* ECS services are checked
* ECS tasks are checked
* Frontend is accessed through the deployed application
* Backend API is tested
* Database connectivity is verified

---

# 📊 Docker Commands

Useful Docker commands used during development:

```bash
docker ps

docker images

docker build -t employee-frontend ./frontend

docker build -t employee-backend ./backend

docker compose up -d

docker compose ps

docker compose logs

docker compose down
```

---

# ☁️ AWS CLI Commands

Examples of AWS commands used by the Jenkins pipeline:

```bash
aws ecr get-login-password \
  --region us-east-1
```

```bash
aws ecs describe-services \
  --cluster employee-management-cluster
```

```bash
aws ecs describe-task-definition
```

```bash
aws ecs register-task-definition
```

```bash
aws ecs update-service
```

---

# 📧 Jenkins Notifications

The pipeline includes post-build email notifications.

## Successful Build

The notification contains:

* Job name
* Build number
* Build status
* Frontend image
* Backend image
* Jenkins build URL
* Deployment status

## Failed Build

The failure notification provides:

* Job name
* Build number
* Failure status
* Jenkins console output link

This helps the DevOps team quickly identify pipeline failures.

---

# 🧹 Pipeline Cleanup

After the pipeline completes, Jenkins removes temporary Docker images and generated task-definition files.

Cleanup includes:

```text
Frontend Docker image
Backend Docker image
ECR-tagged local images
Temporary ECS task-definition JSON files
```

This prevents unnecessary disk-space consumption on the Jenkins server.

---

# ⚙️ Environment Configuration

The Jenkins pipeline uses environment variables for AWS and ECS configuration.

Example:

```groovy
environment {
    AWS_REGION = 'us-east-1'

    AWS_ACCOUNT_ID = '<AWS_ACCOUNT_ID>'

    FRONTEND_REPO = 'employee-frontend'
    BACKEND_REPO  = 'employee-backend'

    ECS_CLUSTER = 'employee-management-cluster'

    FRONTEND_SERVICE = 'employee-frontend-task-services'
    BACKEND_SERVICE  = 'employee-backend-task-service'

    FRONTEND_CONTAINER = 'frontend'
    BACKEND_CONTAINER  = 'backend'
}
```

For production environments, sensitive values should be managed through Jenkins Credentials, IAM Roles, AWS Secrets Manager, or other secure secret-management mechanisms.

---

# 🎯 Project Objectives Achieved

The project demonstrates the following DevOps capabilities:

* ✅ Three-tier application architecture
* ✅ React frontend containerization
* ✅ Flask backend containerization
* ✅ Docker image creation
* ✅ Docker Compose local deployment
* ✅ Git source-code management
* ✅ Jenkins CI/CD pipeline
* ✅ Automated Docker builds
* ✅ Amazon ECR integration
* ✅ Amazon ECS deployment
* ✅ Amazon RDS MySQL integration
* ✅ Automated ECS task-definition updates
* ✅ Build-number-based image versioning
* ✅ Jenkins email notifications
* ✅ Pipeline cleanup
* ✅ Cloud deployment automation

---

# 🚧 Future Improvements

The following features can be added to improve the project further:

* HTTPS using AWS Certificate Manager
* Application Load Balancer
* Route 53 domain
* AWS Secrets Manager
* CloudWatch monitoring
* ECS Auto Scaling
* Docker image scanning using Trivy
* Code quality analysis using SonarQube
* Infrastructure as Code using Terraform
* Automated rollback
* Blue/Green deployment
* Centralized logging
* Prometheus and Grafana monitoring
* Multi-AZ high availability
* Automated database backup and disaster recovery

---

# 📚 DevOps Workflow Summary

```text
             SOURCE CODE
                  |
                  v
             Git / GitHub
                  |
                  v
               Jenkins
                  |
          +-------+-------+
          |               |
          v               v
     Frontend Build   Backend Build
          |               |
          +-------+-------+
                  |
                  v
             Docker Images
                  |
                  v
             Amazon ECR
                  |
                  v
             Amazon ECS
          +-------+-------+
          |               |
          v               v
      Frontend         Backend
      Service          Service
                          |
                          v
                     Amazon RDS
                        MySQL
```

---

# 🏁 Conclusion

This project demonstrates a complete DevOps implementation for a three-tier Employee Management application.

The application was first containerized using Docker and tested locally using Docker Compose. Git and GitHub were used for source-code management. Jenkins was then used to automate the CI/CD workflow.

The Jenkins pipeline automatically builds frontend and backend Docker images, authenticates with Amazon ECR, pushes versioned images, updates ECS task definitions, and deploys the latest application version to Amazon ECS.

Amazon RDS MySQL provides managed database storage for the backend application.

Overall, the project demonstrates how a traditional web application can be transformed into a **containerized, automated, and cloud-deployed application using modern DevOps practices**.

---

## 👨‍💻 Author

**Tamilselvan S**

AWS | DevOps | Docker | Jenkins | AWS ECS | ECR | RDS

---

## ⭐ Project Highlights

```text
React + Flask + MySQL
        ↓
      Docker
        ↓
 Docker Compose
        ↓
     GitHub
        ↓
     Jenkins
        ↓
   Amazon ECR
        ↓
   Amazon ECS
        ↓
   Amazon RDS
```

**End-to-end containerized CI/CD deployment on AWS.**
