pipeline {
    agent any

    environment {
        DOCKER_IMAGE_TAG = "jenkins-${env.BUILD_NUMBER}"
    }
    
    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Build') {
            when {
                expression {
                    return !params.PRODUCTION
                }
            }
            agent {
                label 'swarm-manager'
            }
            steps {
                sh 'docker-compose build --parallel'
            }
        }

        stage('Build (PRODUCTION)') {
            when {
                expression {
                    return params.PRODUCTION
                }
            }
            agent {
                label 'swarm-manager'
            }
            steps {}
                withEnv([
                    "DOCKER_REGISTRY=${params.PRODUCTION_DOCKER_REGISTRY}",
                    "DOCKER_IMAGE_TAG=${params.PRODUCTION_GITHUB_TAG}"
                ]) {
                    sh 'docker-compose build --parallel'
                } 
            }
        }

        // stage('Unit test') {
        //     steps {
        //         echo 'hi'
        //     }
        // }

        stage('Staging') {
             when {
                expression {
                    return !params.PRODUCTION
                }
            }
            agent {
                label 'swarm-manager'
            }
            steps {

                sh 'docker stack rm streamer4user'
                
                sleep(30)

                // Streamer secrets
                configFileProvider([configFile(fileId: 'streamer_service_config.json', variable: 'SERVICE_CONFIG')]) {
                    sh 'docker secret rm streamer-service-config.json || true'
                    sh 'docker secret create streamer-service-config.json $SERVICE_CONFIG'
                }
                configFileProvider([configFile(fileId: 'streamer_mailer_config.json', variable: 'MAILER_CONFIG')]) {
                    sh 'docker secret rm streamer-mailer-config.json || true'
                    sh 'docker secret create streamer-mailer-config.json $MAILER_CONFIG'
                }

                // Streamer UI secrets
                configFileProvider([configFile(fileId: 'streamer_ui_config.json', variable: 'UI_CONFIG')]) {
                    sh 'docker secret rm streamer-ui-config.json || true'
                    sh 'docker secret create streamer-ui-config.json $UI_CONFIG'
                }
                configFileProvider([configFile(fileId: 'streamer_ui_adconfig.json', variable: 'UI_ADCONFIG')]) {
                    sh 'docker secret rm streamer-ui-adconfig.json || true'
                    sh 'docker secret create streamer-ui-adconfig.json $UI_ADCONFIG'
                }
                configFileProvider([configFile(fileId: 'streamer_ui_ldapscert.crt', variable: 'UI_LDAPSCERT')]) {
                    sh 'docker secret rm streamer-ui-ldapscert.crt || true'
                    sh 'docker secret create streamer-ui-ldapscert.crt $UI_LDAPSCERT'
                }

                sh 'docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always streamer4user'
            }
        }

        stage('Health check') {
             when {
                expression {
                    return !params.PRODUCTION
                }
            }
            agent {
                docker {
                    image 'jwilder/dockerize'
                    args '--network streamer4user_default'
                }
            }
            steps {
                sh (
                    label: 'Waiting for services to become available',
                    script: 'dockerize \
                        -timeout 120s \
                        -wait tcp://service:3001 \
                        -wait http://ui:9000'
                )
            }
        }

        // stage('Integration test') {
        //     steps {
        //         echo 'hi'
        //     }
        // }

        stage('Tag and push (PRODUCTION)') {
            when {
                expression {
                    return params.PRODUCTION
                }
            }
            steps {
                echo "production: true"
                echo "production github tag: ${params.PRODUCTION_GITHUB_TAG}"

                // Handle Github tags
                withCredentials([
                    usernamePassword (
                        credentialsId: params.GITHUB_CREDENTIALS,
                        usernameVariable: 'GITHUB_USERNAME',
                        passwordVariable: 'GITHUB_PASSWORD'
                    )
                ]) {
                    // Remove local tag (if any)
                    script {
                        def statusCode = sh(script: "git tag --list | grep ${params.PRODUCTION_GITHUB_TAG}", returnStatus: true)
                        if(statusCode == 0) {
                            sh "git tag -d ${params.PRODUCTION_GITHUB_TAG}"
                            echo "Removed local tag ${params.PRODUCTION_GITHUB_TAG}"
                        }
                    }
                    
                    // Create local tag
                    sh "git tag -a ${params.PRODUCTION_GITHUB_TAG} -m 'jenkins'"
                    echo "Created local tag ${params.PRODUCTION_GITHUB_TAG}"

                    // Remove remote tag (if any)
                    script {
                        def result = sh(script: "git ls-remote https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/Donders-Institute/data-streamer.git refs/tags/${params.PRODUCTION_GITHUB_TAG}", returnStdout: true).trim()
                        if (result != "") {
                            sh "git push --delete https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/Donders-Institute/data-streamer.git ${params.PRODUCTION_GITHUB_TAG}"
                            echo "Removed remote tag ${params.PRODUCTION_GITHUB_TAG}"
                        }
                    }

                    // Create remote tag
                    sh "git push https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/Donders-Institute/data-streamer.git ${params.PRODUCTION_GITHUB_TAG}"
                    echo "Created remote tag ${params.PRODUCTION_GITHUB_TAG}"
                }

                // Push Docker images to production Docker registry
                withEnv([
                    "DOCKER_REGISTRY=${params.PRODUCTION_DOCKER_REGISTRY}",
                    "DOCKER_IMAGE_TAG=${params.PRODUCTION_GITHUB_TAG}"
                ]) {
                    // sh 'docker-compose push'
                    echo "Pushed images to ${DOCKER_REGISTRY}"
                } 
            }
        }
    }

    post {
        always {
            echo 'cleaning'
            sh 'docker system prune -f'
        }
    }
}
