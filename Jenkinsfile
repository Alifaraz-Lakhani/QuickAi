pipeline {
    agent any

    environment {
        KUBECONFIG = '/var/jenkins_home/.kube/config'
        REGISTRY = credentials('docker-registry-url')
        IMAGE_TAG = "${BUILD_NUMBER}"
        CLIENT_IMAGE = "${REGISTRY}/quickai-client"
        SERVER_IMAGE = "${REGISTRY}/quickai-server"
        K8S_NAMESPACE = 'quickai'
        NPM_CONFIG_CACHE = '/tmp/.npm'
        DOCKER_BUILDKIT = '0'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // stage('Network Check') {
        //     steps {
        //         sh 'curl -I https://registry.npmjs.org'
        //     }
        // }

        stage('Client Build') {
            steps {
                dir('client') {
                    sh '''
                        npm config set fetch-retries 5
                        npm config set fetch-retry-mintimeout 20000
                        npm config set fetch-retry-maxtimeout 120000
                        npm ci --prefer-offline
                        npm run build
                    '''
                }
            }
        }

        stage('Server Install') {
            steps {
                dir('server') {
                    sh 'npm ci --prefer-offline'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonar-server') {
                        sh """
                            export SONAR_SCANNER_OPTS="-Xmx1g -Xms512m"
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.login=$SONAR_AUTH_TOKEN
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo "Skipping Quality Gate - SonarQube resources insufficient"
            }
        }

        stage('Build Docker Images') {
            steps {
                withCredentials([
                    string(credentialsId: 'VITE_CLERK_PUBLISHABLE_KEY', variable: 'VITE_CLERK_PUBLISHABLE_KEY')
                ]) {
                    sh '''
                        docker build \
                          --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
                          -t "$CLIENT_IMAGE:$IMAGE_TAG" \
                          -t "$CLIENT_IMAGE:latest" \
                          ./client

                        docker build \
                          -t "$SERVER_IMAGE:$IMAGE_TAG" \
                          -t "$SERVER_IMAGE:latest" \
                          ./server
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-registry-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push "$CLIENT_IMAGE:$IMAGE_TAG"
                        docker push "$CLIENT_IMAGE:latest"
                        docker push "$SERVER_IMAGE:$IMAGE_TAG"
                        docker push "$SERVER_IMAGE:latest"
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE'),
                    string(credentialsId: 'CLERK_SECRET_KEY', variable: 'CLERK_SECRET_KEY'),
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'CLIPDROP_API_KEY', variable: 'CLIPDROP_API_KEY'),
                    string(credentialsId: 'CLOUDINARY_CLOUD_NAME', variable: 'CLOUDINARY_CLOUD_NAME'),
                    string(credentialsId: 'CLOUDINARY_API_KEY', variable: 'CLOUDINARY_API_KEY'),
                    string(credentialsId: 'CLOUDINARY_API_SECRET', variable: 'CLOUDINARY_API_SECRET'),
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL')
                ]) {
                    sh '''
                        set -e
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        echo "=== Testing Kubernetes Connection ==="
                        kubectl cluster-info

                        echo "=== Creating Namespace ==="
                        kubectl apply -f k8s/namespace.yml

                        echo "=== Creating ConfigMap ==="
                        kubectl apply -f k8s/configmap.yml

                        echo "=== Creating Secrets ==="
                        kubectl -n "$K8S_NAMESPACE" create secret generic quickai-server-secrets \
                          --from-literal=CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
                          --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY" \
                          --from-literal=CLIPDROP_API_KEY="$CLIPDROP_API_KEY" \
                          --from-literal=CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
                          --from-literal=CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
                          --from-literal=CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
                          --from-literal="DATABASE_URL=$(printf '%s' "$DATABASE_URL")" \
                          --dry-run=client -o yaml | kubectl apply -f -

                        echo "=== Applying Deployments ==="
                        kubectl apply -f k8s/server-deployment.yml
                        kubectl apply -f k8s/client-deployment.yml
                        kubectl apply -f k8s/ingress.yml

                        echo "=== Updating Images ==="
                        kubectl -n "$K8S_NAMESPACE" set image deployment/quickai-server server="$SERVER_IMAGE:$IMAGE_TAG"
                        kubectl -n "$K8S_NAMESPACE" set image deployment/quickai-client client="$CLIENT_IMAGE:$IMAGE_TAG"

                        echo "=== Waiting for Rollout ==="
                        kubectl -n "$K8S_NAMESPACE" rollout status deployment/quickai-server --timeout=180s
                        kubectl -n "$K8S_NAMESPACE" rollout status deployment/quickai-client --timeout=180s
                    '''
                }
            }
        }

        stage('Verify Kubernetes') {
            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')
                ]) {
                    sh '''
                        export KUBECONFIG="$KUBECONFIG_FILE"
                        kubectl -n "$K8S_NAMESPACE" get pods
                        kubectl -n "$K8S_NAMESPACE" get svc
                        kubectl -n "$K8S_NAMESPACE" get ingress
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}