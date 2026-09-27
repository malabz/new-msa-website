#!/bin/sh
# Run inside alpine:3.22, mounting an output directory at /out.
set -eu
apk add --no-cache build-base perl linux-headers openssl-dev openssl-libs-static ca-certificates curl xz
cd /tmp
version=8.22.0
curl --connect-timeout 15 --max-time 120 --retry 2 -fsSLO "https://curl.se/download/curl-$version.tar.xz"
sha256sum "curl-$version.tar.xz"
tar -xf "curl-$version.tar.xz"
cd "curl-$version"
LDFLAGS=-static ./configure --disable-shared --enable-static --with-openssl \
  --disable-threaded-resolver --disable-ldap --disable-ldaps --disable-docs \
  --disable-manual --without-libpsl --without-zstd --without-brotli \
  --without-libidn2 --without-nghttp2 --without-nghttp3 --without-libssh2 --without-zlib
make -j4
strip src/curl
cp src/curl /out/curl
cp /etc/ssl/certs/ca-certificates.crt /out/cacert.pem
{
  echo "curl source: https://curl.se/download/curl-$version.tar.xz"
  sha256sum "/tmp/curl-$version.tar.xz"
  apk info -v musl openssl-libs-static
  /out/curl --version
} > /out/BUILD.txt
cd /out
sha256sum curl cacert.pem BUILD.txt > CLIENT.sha256
