
.PHONY: clean
clean:
	npm run clean

.PHONY: install
install: 
	npm install

.PHONY: build
build: 
	npm run build

.PHONY: test
test: build
	npm test

.PHONY: coverage
coverage: build
	npm run coverage

.PHONY: all
all: 
	npm run all

.PHONY: release
release: all
	npm prune --production 