# Mirth admin web

##-- Environment Variables --#

# Image and container registry
IMAGE_NAME := mirth-admin-webapp
# IMAGE_PATH := mygroup/myproject
IMAGE_PATH := saga-it
# REGISTRY   := registry-url:port
REGISTRY   := 853450806095.dkr.ecr.us-east-2.amazonaws.com
IMAGE      := $(REGISTRY)/$(IMAGE_PATH)/$(IMAGE_NAME)

# Get current branch and transform '/' to '-'
BRANCH := $(or $(CI_COMMIT_REF_NAME), `git rev-parse --abbrev-ref HEAD`)
BRANCH := $(shell echo $(BRANCH) | tr / -)
VERSION := $(shell git describe --always)

# Retrieve first 7 characters of current commit hash
SHORT_HASH := `git rev-parse --short HEAD`

# Docker image tag for a local build
BUILD_TAG := $(IMAGE):latest-dev

# Docker image tag that will be pushed to the registry
#TAG := $(IMAGE):$(BRANCH)-$(SHORT_HASH)
TAG := $(IMAGE):$(VERSION)

##-- Main Makefile Targets --##

.PHONY: docker-dist
docker-dist: docker-build docker-tag

.PHONY: dist
dist: node-clean node-build

# test - run unit tests
.PHONY: node-test
test:
	echo "There are no tests to run"

# deploy - push image into registry
.PHONY: docker-push
docker-push: docker-login
	docker push $(TAG)
	docker push $(BUILD_TAG)

##-- Extra Makefile Targets --##

# clean - cleanup project space
.PHONY: node-clean
node-clean:
	-rm -r dist node_modules

# shell - open a shell on the build container
.PHONY: docker-shell
docker-shell:
	docker run --interactive --tty --rm --name testing $(BUILD_TAG) /bin/sh
# docker exec -it $(IMAGE_NAME) /bin/sh

# build the project
.PHONY: node-build
node-build:
	npm install
	npm run preprod-build

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
# docker-login:
# 		@$(if $(and $(CI_REGISTRY_USER), $(CI_REGISTRY_PASSWORD)), \
# 				docker login -u $(CI_REGISTRY_USER) \
# 						-p $(CI_REGISTRY_PASSWORD) \
# 						$(CI_REGISTRY), \
# 	   docker login $(REGISTRY))

.PHONY: minikube-image
minikube-image:
	minikube image build -t $(TAG) .

.PHONY: kubectl-apply
kubectl-apply:
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/service.yaml
	kubectl apply -f k8s/ingress.yaml
	kubectl rollout restart -f k8s/deployment.yaml

#podman build --tag minikube-dev.local:5000/$(IMAGE_NAME) $(PWD)
#podman push --tls-verify=false minikube-dev.local:5000/$(IMAGE_NAME)
#eval $$(minikube podman-env) && podman-remote build -t $(IMAGE_NAME) $(PWD)

##-- Debug --##

# debug - display all environment variables
.PHONY: debug
debug:
	@echo "IMAGE:     $(IMAGE)"
	@echo "BUILD_TAG: $(BUILD_TAG)"
	@echo "TAG:       $(TAG)"

# end
