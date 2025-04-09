docker ps -a | grep back-letmecook-back-1

docker rm back-letmecook-back-1

cd back && docker compose build back

docker compose build letmecook-back

docker compose exec letmecook-back npx prisma generate

docker-compose restart letmecook-back
