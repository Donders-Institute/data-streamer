pipeline {
    agent any

    environment {
        DOCKER_IMAGE_TAG = "jenkins-${env.BUILD_NUMBER}"
        SERVICE_URL = 'tcp://service:3001'
        UI_URL = 'http://ui:9000'
    }
    
    options {
        disableConcurrentBuilds()
    }

    stages {
        // stage('Build') {
        //     agent {
        //         label 'swarm-manager'
        //     }
        //     steps {
        //         sh 'docker-compose build --parallel'
        //     }
        //     post {
        //         success {
        //             script {
        //                 if (env.DOCKER_REGISTRY) {
        //                     sh 'docker-compose push'
        //                 }
        //                 sh 'docker system prune -f'
        //             }
        //         }
        //     }
        // }

        // stage('Unit test') {
        //     steps {
        //         echo 'hi'
        //     }
        // }

        // stage('Staging') {
        //     agent {
        //         label 'swarm-manager'
        //     }
        //     steps {

        //         sh 'docker stack rm streamer4user'
                
        //         sleep(30)

        //         // Streamer secrets
        //         configFileProvider([configFile(fileId: 'streamer_service_config.json', variable: 'SERVICE_CONFIG')]) {
        //             sh 'docker secret rm streamer-service-config.json || true'
        //             sh 'docker secret create streamer-service-config.json $SERVICE_CONFIG'
        //         }
        //         configFileProvider([configFile(fileId: 'streamer_mailer_config.json', variable: 'MAILER_CONFIG')]) {
        //             sh 'docker secret rm streamer-mailer-config.json || true'
        //             sh 'docker secret create streamer-mailer-config.json $MAILER_CONFIG'
        //         }

        //         // Streamer UI secrets
        //         configFileProvider([configFile(fileId: 'streamer_ui_config.json', variable: 'UI_CONFIG')]) {
        //             sh 'docker secret rm streamer-ui-config.json || true'
        //             sh 'docker secret create streamer-ui-config.json $UI_CONFIG'
        //         }
        //         configFileProvider([configFile(fileId: 'streamer_ui_adconfig.json', variable: 'UI_ADCONFIG')]) {
        //             sh 'docker secret rm streamer-ui-adconfig.json || true'
        //             sh 'docker secret create streamer-ui-adconfig.json $UI_ADCONFIG'
        //         }
        //         configFileProvider([configFile(fileId: 'streamer_ui_ldapscert.crt', variable: 'UI_LDAPSCERT')]) {
        //             sh 'docker secret rm streamer-ui-ldapscert.crt || true'
        //             sh 'docker secret create streamer-ui-ldapscert.crt $UI_LDAPSCERT'
        //         }

        //         sh 'docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always streamer4user'
        //     }
        // }

        // stage('Health check') {
        //     agent {
        //         docker {
        //             image 'jwilder/dockerize'
        //             args '--network streamer4user_default'
        //         }
        //     }
        //     steps {
        //         sh (
        //             label: 'Waiting for services to become available',
        //             script: 'dockerize \
        //                 -timeout 120s \
        //                 -wait tcp://service:3001 \
        //                 -wait http://ui:9000'
        //         )
        //     }
        // }

        stage('Integration test') {
            steps {
                echo 'hi'
            }
        }

        stage('Tag for Github and push to production Docker registry') {
            when {
                expression {
                    return params.PRODUCTION
                }
            }
            steps {
                    withEnv(['DOCKER_REGISTRY=' + params.PRODUCTION_DOCKER_REGISTRY]) {
                        echo "production: true"

                        echo "production github tag: ${params.PRODUCTION_GITHUB_TAG}"
                        withCredentials([
                            usernamePassword (
                                credentialsId: params.GITHUB_CREDENTIALS,
                                usernameVariable: 'GITHUB_USERNAME',
                                passwordVariable: 'GITHUB_PASSWORD'
                            )
                        ]) {
                            sh "git tag -d ${params.PRODUCTION_GITHUB_TAG}"
                            sh "git tag -a ${params.PRODUCTION_GITHUB_TAG} -m 'jenkins'"
                            sh "git push origin ${params.PRODUCTION_GITHUB_TAG}"
                        }

                        echo "production Docker registry: ${env.DOCKER_REGISTRY}"
                        // sh 'docker-compose push'
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
