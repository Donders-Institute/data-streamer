pipeline {
    agent any
    
    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Build') {
            agent {
                label 'swarm-manager'
            }
            steps {
                sh 'docker-compose build --parallel'
            }
            post {
                success {
                    script {
                        if (env.DOCKER_REGISTRY) {
                            sh 'docker-compose push'
                        }
                        sh 'docker system prune -f'
                    }
                }
            }
        }

        stage('Unit test') {
            steps {
                sh 'echo hi'
            }
        }

        stage('Staging') {
            agent {
                label 'swarm-manager'
            }
            steps {

                configFileProvider([configFile(fileId: 'streamer_service_config.json', variable: 'SERVICE_CONFIG')]) {
                    sh 'docker secret rm streamer-service-config.json || true'
                    sh 'docker secret create streamer-service-config.json $SERVICE_CONFIG'
                }
                configFileProvider([configFile(fileId: 'streamer_mailer_config.json', variable: 'MAILER_CONFIG')]) {
                    sh 'docker secret rm streamer-mailer-config.json || true'
                    sh 'docker secret create streamer-mailer-config.json $MAILER_CONFIG'
                }

                sh 'docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always streamer4user'
            }
        }
        stage('Integration test') {
            steps {
                sh 'echo hi'
            }
        }
    }

    post {
        always {
            sh 'echo cleaning'
        }
    }
}
