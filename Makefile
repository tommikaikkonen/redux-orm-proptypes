BIN=node_modules/.bin

clean:
	rm -rf lib
	rm -rf docs

build: clean
	$(BIN)/babel src --out-dir lib

test: lint
	NODE_ENV=test $(BIN)/jest

test-watch: lint
	NODE_ENV=test $(BIN)/jest --watch

lint:
	$(BIN)/eslint src

PHONY: build clean test test-watch lint