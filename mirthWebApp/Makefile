# Image and container registry
IMAGE_NAME := mirthconnect
IMAGE_PATH := saga-it
REGISTRY   := 853450806095.dkr.ecr.us-east-2.amazonaws.com
IMAGE      := $(REGISTRY)/$(IMAGE_PATH)/$(IMAGE_NAME)

# Get current branch and transform '/' to '-'
BRANCH := $(or $(CI_COMMIT_REF_NAME), `git rev-parse --abbrev-ref HEAD`)
BRANCH := $(shell echo $(BRANCH) | tr / -)

MIRTH_VERSION := 4.2.0.b2825

# Retrieve first 7 characters of current commit hash
SHORT_HASH := `git rev-parse --short HEAD`

# Docker image tag for a local build
BUILD_TAG := $(IMAGE):build

# Docker image tag that will be pushed to the registry
# TAG := $(IMAGE):$(MIRTH_VERSION)-$(BRANCH)-$(SHORT_HASH)
TAG := $(IMAGE):latest

##-- Main Makefile Targets --##

.PHONY: docker-dist
docker-dist: docker-build docker-tag

.PHONY: docker-push
docker-push: docker-login
	docker push $(TAG)

# shell - open a shell on the build container
.PHONY: docker-shell
docker-shell:
	docker run --interactive --tty --rm --name testing $(BUILD_TAG) /bin/sh
# docker exec -it $(IMAGE_NAME) /bin/sh

# docker-build - build an image with a local build tag
.PHONY: docker-build
docker-build:
	docker build --tag $(BUILD_TAG) --rm --compress $(PWD)

.PHONY: docker-run
docker-run:
	docker run -d --name $(IMAGE_NAME) -p 8443:8443 --rm $(BUILD_TAG)

# docker-tag - prep local built image with tag for pushing to registry
.PHONY: docker-tag
docker-tag:
	docker tag $(BUILD_TAG) $(TAG)

# docker-login - login to registry using vars if available,
#                otherwise interactive login.
.PHONY: docker-login
docker-login:
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 853450806095.dkr.ecr.us-east-2.amazonaws.com

# .PHONY: minikube-image
# minikube-image:
# 	minikube image build -t $(TAG) .

# .PHONY: kubectl-apply
# kubectl-apply:
# 	@echo "Is the following the correct context!? If not - use CTRL-C to stop this script. Otherwise press Enter."
# 	kubectl config current-context
# 	read
# 	sleep 3
# 	sed -e "s|{{IMAGE_NAME}}|$(TAG)|g" k8s.yaml | kubectl apply -f -

##-- Debug --##

# debug - display all environment variables
.PHONY: debug
debug:
	@echo "IMAGE:     $(IMAGE)"
	@echo "BUILD_TAG: $(BUILD_TAG)"
	@echo "TAG:       $(TAG)"

# end
