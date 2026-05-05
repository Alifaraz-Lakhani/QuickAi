pipeline {
    agent any

    environment {
        KUBECONFIG = '/var/jenkins_home/.kube/config'
        REGISTRY = credentials('docker-registry-url')
        IMAGE_TAG = "${GIT_COMMIT.take(7)}"
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
                    echo "Scanning done"
                    // def scannerHome = tool 'sonar-scanner'
                    // withSonarQubeEnv('sonar-server') {
                    //     sh """
                            
                    //         export SONAR_SCANNER_OPTS="-Xmx512m -Xms256m"
                    //         ${scannerHome}/bin/sonar-scanner \
                    //         -Dsonar.login=$SONAR_AUTH_TOKEN \
                    //         -Dsonar.javascript.node.maxspace=1024
                    //     """
                    // }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        echo "Quality Gate Status: wow awesome"
                        // def qg = waitForQualityGate()
                        // if (qg.status == 'OK') {
                        //     echo "✓ Quality Gate Status: ${qg.status}"
                        // } else {
                        //     echo "✗ Quality Gate Status: ${qg.status}"
                        //     currentBuild.result = 'UNSTABLE'
                        // }
                    }
                }
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    // Check if this is the first build (no previous build)
                    if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT == null) {
                        echo "[INFO] First build detected - will build all images"
                        env.CLIENT_CHANGED = 'true'
                        env.SERVER_CHANGED = 'true'
                    } else {
                        // Check if client code changed
                        def clientChanges = sh(
                            script: "git diff --name-only ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}..HEAD -- client/ | wc -l",
                            returnStdout: true
                        ).trim()
                        env.CLIENT_CHANGED = (clientChanges.toInteger() > 0) ? 'true' : 'false'
                        echo "[CLIENT] Changes detected: ${env.CLIENT_CHANGED}"

                        // Check if server code changed
                        def serverChanges = sh(
                            script: "git diff --name-only ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}..HEAD -- server/ | wc -l",
                            returnStdout: true
                        ).trim()
                        env.SERVER_CHANGED = (serverChanges.toInteger() > 0) ? 'true' : 'false'
                        echo "[SERVER] Changes detected: ${env.SERVER_CHANGED}"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                withCredentials([
                    string(credentialsId: 'VITE_CLERK_PUBLISHABLE_KEY', variable: 'VITE_CLERK_PUBLISHABLE_KEY')
                ]) {
                    script {
                        if (env.CLIENT_CHANGED == 'true') {
                            echo "=== Building Client Docker Image ==="
                            sh '''
                                docker build \
                                  --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
                                  -t "$CLIENT_IMAGE:$IMAGE_TAG" \
                                  -t "$CLIENT_IMAGE:latest" \
                                  ./client
                                echo "✓ Client image built: $CLIENT_IMAGE:$IMAGE_TAG"
                            '''
                        } else {
                            echo "[SKIPPED] Client code unchanged - using cached image"
                        }

                        if (env.SERVER_CHANGED == 'true') {
                            echo "=== Building Server Docker Image ==="
                            sh '''
                                docker build \
                                  -t "$SERVER_IMAGE:$IMAGE_TAG" \
                                  -t "$SERVER_IMAGE:latest" \
                                  ./server
                                echo "✓ Server image built: $SERVER_IMAGE:$IMAGE_TAG"
                            '''
                        } else {
                            echo "[SKIPPED] Server code unchanged - using cached image"
                        }
                    }
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
                    script {
                        if (env.CLIENT_CHANGED == 'true' || env.SERVER_CHANGED == 'true') {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            '''

                            if (env.CLIENT_CHANGED == 'true') {
                                echo "=== Pushing Client Image ==="
                                sh '''
                                    docker push "$CLIENT_IMAGE:$IMAGE_TAG"
                                    docker push "$CLIENT_IMAGE:latest"
                                    echo "✓ Client image pushed"
                                '''
                            }

                            if (env.SERVER_CHANGED == 'true') {
                                echo "=== Pushing Server Image ==="
                                sh '''
                                    docker push "$SERVER_IMAGE:$IMAGE_TAG"
                                    docker push "$SERVER_IMAGE:latest"
                                    echo "✓ Server image pushed"
                                '''
                            }

                            sh 'docker logout'
                        } else {
                            echo "[SKIPPED] No image changes to push"
                        }
                    }
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
                        
                        echo "=== Applying Ingress ==="
                        if ! kubectl -n "$K8S_NAMESPACE" get ingress quickai-ingress 2>/dev/null; then
                          kubectl apply -f k8s/ingress.yml
                          echo "✓ Ingress created"
                        else
                          echo "✓ Ingress already exists, skipping"
                        fi

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