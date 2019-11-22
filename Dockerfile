FROM cloudposse/github-status-updater:0.2.0-98
# https://github.com/cloudposse/github-status-updater

RUN apk add bash jq git && rm -rf /var/cache/apk/*
ADD update-status.sh /usr/bin/update-commit-status.sh

ENTRYPOINT [ "/usr/bin/update-commit-status.sh" ]