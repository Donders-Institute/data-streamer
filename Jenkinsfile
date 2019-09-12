pipeline {
    agent any
    
    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Prepare config files') {
            steps {
                configFileProvider([configFile(fileId: 'streamer_service_config.json', variable: 'SERVICE_CONFIG')]) {
                    sh 'cp $SERVICE_CONFIG streamer/config/default.json'
                    sh 'cat streamer/config/default.json'
                }
                configFileProvider([configFile(fileId: 'streamer_mailer_config.json', variable: 'MAILER_CONFIG')]) {
                    sh 'cp $MAILER_CONFIG streamer/config/mailer.json'
                    sh 'cat streamer/config/mailer.json'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose build --parallel'
            }
            post {
                success {
                    script {
                        if (env.DOCKER_REGISTRY) {
                            sh('docker-compose push')
                        }
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
            steps {
                    sh 'docker -H env.DOCKER_SWARM_MASTER_HOST stack rm streamer4user'
                    sh 'docker -H env.DOCKER_SWARM_MASTER_HOST stack up -c docker-compose.yml -c docker-compose.swarm.yml streamer4user'
            }
        }
        stage('Integration test') {
            steps {
                sh 'echo hi'
            }
        }
    }

    // post {
    //     always {
    //         mattermostSend message: "test"

    //         mail
    //     }
    // }
}
