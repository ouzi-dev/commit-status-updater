
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

.PHONY: semantic-release
semantic-release:
	npm ci
	npx semantic-release

.PHONY: semantic-release-dry-run
semantic-release-dry-run:
	npm ci
	npx semantic-release -d

.PHONY: install-npm-check-updates
install-npm-check-updates:
	npm install npm-check-updates

.PHONY: update-denendencies
update-denendencies: install-npm-check-updates
	ncu -u
	npm install