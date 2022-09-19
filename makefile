all: clean build-app build-docker start-application
clean:
	rm -rf ./build
build-app:
	npm run build
build-docker:	
	docker build . -t fabio-nunes/user-tasks-challenge
start-application:
	docker compose up -d