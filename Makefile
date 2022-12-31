start:
	npx react-scripts start

build: lint
	npx react-scripts build

lint:
	npx eslint --fix --ext .tsx,.ts,.js src

test:
	npx jest shuffle.test.ts