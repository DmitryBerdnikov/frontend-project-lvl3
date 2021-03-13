serve:
	NODE_ENV=development npx webpack serve

install:
	npm ci

prod:
	npx webpack

test:
	npm test

lint:
	npx eslint .

test-coverage:
	npm test -- --coverage
