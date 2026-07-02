NODE_DIR=multi-language-modules/nodejs-typescript
PY_DIRS=academic-utilities multi-language-modules/python-data-science devops-and-automation

.PHONY: setup build test dev python-check node-build node-test docker-demo-config

setup:
	bash setup.sh

build: python-check node-build

test: node-test

dev:
	cd $(NODE_DIR) && npm run dev

python-check:
	python3 -m compileall -q $(PY_DIRS)

node-build:
	cd $(NODE_DIR) && npm ci && npm run build

node-test:
	cd $(NODE_DIR) && npm test

docker-demo-config:
	docker compose -f devops-and-automation/docker-compose/docker-compose.demo.yml config
