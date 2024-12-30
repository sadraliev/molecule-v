dev:
	npm run start:dev
build:
	npm run build
format:
	npm run format
lint:
	npm run lint
watch:
	npm run test:watch

mongo:
	docker-compose --env-file .env.development.local up mongodb -d
down:
	docker-compose down -v