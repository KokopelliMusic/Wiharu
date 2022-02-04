start:
	npx react-scripts start

build: lint
	npx react-scripts build

lint:
	npx eslint . --ext .ts