
PROJECT_HOME=~/projects/lambda-lang_Pages/

final: parser.js

parser.js: grammar.peg build.js
	./build.js > parser.js

.PHONY: clean
clean:
	rm parser.js

.PHONY: deploy
# Copy parser, interpreter and tests
deploy:
	cp parser.js $(PROJECT_HOME)
	cp interpreter.js $(PROJECT_HOME)
	cp tests/* $(PROJECT_HOME)

