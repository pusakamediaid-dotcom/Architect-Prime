NODE_DIR=multi-language-modules/nodejs-typescript
PY_DIRS=academic-utilities multi-language-modules/python-data-science devops-and-automation
DATABASE_URL?=file:./dev.db

.PHONY: setup build test dev python-check node-install node-prisma node-build node-lint node-test node-audit docker-demo-config

setup:
	bash setup.sh

build: python-check node-install node-prisma node-build

test: node-test

dev:
	cd $(NODE_DIR) && DATABASE_URL=$(DATABASE_URL) npm run dev

python-check:
	python3 -m compileall -q $(PY_DIRS)

node-install:
	cd $(NODE_DIR) && npm ci

node-prisma:
	cd $(NODE_DIR) && DATABASE_URL=$(DATABASE_URL) npm run prisma:generate && DATABASE_URL=$(DATABASE_URL) npm run prisma:migrate

node-build:
	cd $(NODE_DIR) && npm run build

node-lint:
	cd $(NODE_DIR) && npm run lint

node-test:
	cd $(NODE_DIR) && npm test

node-audit:
	cd $(NODE_DIR) && npm audit --audit-level=high

docker-demo-config:
	docker compose -f devops-and-automation/docker-compose/docker-compose.demo.yml config
