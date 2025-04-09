#!/bin/bash

# Arrêter Nginx temporairement
docker-compose -f docker-compose.prod.yml stop nginx

# Renouveler les certificats
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -p 80:80 \
  certbot/certbot renew

# Redémarrer Nginx
docker-compose -f docker-compose.prod.yml start nginx 