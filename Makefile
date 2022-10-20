split-by-dot = $(word $2,$(subst ., ,$1))

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

.PHONY: update-dependencies
update-dependencies: install-npm-check-updates
	ncu -u
	npm install

.PHONY: tag-major
tag-major: check-version
	$(eval TAG := $(call split-by-dot,$(VERSION),1))
	@echo "Tagging major version $(TAG)"
	git tag -f $(TAG)
	git push -f origin $(TAG)

.PHONY: check-version
check-version:
ifndef VERSION
	$(error VERSION not defined)
endif 