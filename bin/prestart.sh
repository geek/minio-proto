#!/bin/bash

# Copy triton creds from env vars to files on disk
if [ -n ${!TRITON_CREDS_PATH} ] \
    && [ -n ${!TRITON_CA} ] \
    && [ -n ${!TRITON_CERT} ] \
    && [ -n ${!TRITON_KEY} ]
then
    mkdir -p ${TRITON_CREDS_PATH}
    echo -e "${TRITON_CA}" | tr '#' '\n' > ${TRITON_CREDS_PATH}/ca.pem
    echo -e "${TRITON_CERT}" | tr '#' '\n' > ${TRITON_CREDS_PATH}/cert.pem
    echo -e "${TRITON_KEY}" | tr '#' '\n' > ${TRITON_CREDS_PATH}/key.pem
fi

eval `/usr/bin/ssh-agent -s`
mkdir -p ~/.ssh
echo -e "${SDC_KEY_PUB}" | tr '#' '\n' > ~/.ssh/id_rsa.pub
echo -e "${SDC_KEY}" | tr '#' '\n' > ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa.pub
chmod 400 ~/.ssh/id_rsa
ssh-add ~/.ssh/id_rsa


# Copy NGINX creds from env vars to files on disk
if [ -n ${!NGINX_CA_CRT} ] \
    && [ -n ${!NGINX_SERVER_KEY} ] \
    && [ -n ${!NGINX_SERVER_CRT} ]
then
    local nginx_path=/etc/nginx/certs
    mkdir -p $nginx_path
    mkdir -p $nginx_path/ca
    mkdir -p $nginx_path/server
    echo -e "${NGINX_CA_CRT}" | tr '#' '\n' > $nginx_path/ca/ca.crt
    echo -e "${NGINX_SERVER_KEY}" | tr '#' '\n' > $nginx_path/server/server.key
    echo -e "${NGINX_SERVER_CRT}" | tr '#' '\n' > $nginx_path/server/server.crt

    chmod 444 $nginx_path/ca/ca.crt
    chmod 444 $nginx_path/server/server.key
    chmod 444 $nginx_path/server/server.crt
fi
