#!/bin/sh

mkdir ./certs
cd ./certs

# Generate new key
openssl genrsa -out server.key 4096
# Generate CSR from the generated key
openssl req -batch -new -key server.key -out server.csr -subj "/C=jp/ST=Tokyo/L=Chiyoda-ku/O=\"Examples Co.,Ltd.\"/OU=Foo/CN=Foo"
# Sign the CSR to generate new certificate
openssl x509 -req -days 3650 -signkey server.key -in server.csr -out server.crt
