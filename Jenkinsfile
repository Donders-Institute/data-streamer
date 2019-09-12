pipeline {
    agent any
    stages {
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
            stages {
                steps {
                        sh 'docker -H env.DOCKER_SWARM_MASTER_HOST stack rm streamer4user'
                        sh 'docker -H env.DOCKER_SWARM_MASTER_HOST stack up -c docker-compose.yml streamer4user'
                }
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
