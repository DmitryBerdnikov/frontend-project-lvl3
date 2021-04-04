serve:
	npm run start

install:
	npm ci

build:
	npm run build

test:
	npm test

lint:
	npx eslint .

test-coverage:
	npm test -- --coverage
