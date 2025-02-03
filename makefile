dev:
	npm run start:dev
build:
	npm run build
format:
	npm run format
lint:
	npm run lint
unit:
	npm run test:watch
e2e:
	npm run test:e2e -- $(file) --watch --detectOpenHandles
seed:
	npm run seed

mongodb:
	docker-compose --env-file .env.development.local up mongodb -d
down:
	docker-compose down -v

commit:
	npm run commit
	
refine-branches:
	@echo "Fetch and prune remote branches"
	git fetch --all --prune
	
	@echo "Deleting local branches except 'main' and 'dev'..."
	git branch | grep -vE '^\*|main|dev' | xargs git branch -D