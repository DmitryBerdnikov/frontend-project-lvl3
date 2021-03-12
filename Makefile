serve:
	npx webpack serve

install:
	npm ci

prod:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

test-coverage:
	npm test -- --coverage
