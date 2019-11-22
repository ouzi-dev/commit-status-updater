.PHONY: build
build:
	chmod +x update-status.sh
	docker build -t commit-status-updater . 

.PHONY: shellcheck
shellcheck: 
	docker run --rm -v "$(CURDIR):/mnt" koalaman/shellcheck:stable update-status.sh