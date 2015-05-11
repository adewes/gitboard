#!/bin/bash


ifeq ($(ENVIRONMENT),production)
	BUILD_TMP_DIR=newBuild
	BUILD_ENVIRONMENT=production
else
	BUILD_TMP_DIR=build
	BUILD_ENVIRONMENT=development
endif

$(info Build dir: $(BUILD_TMP_DIR))

BUILD_FINAL_DIR=build
BUILD_BACKUP_DIR=lastBuild
SOURCE_DIR=src

CSS_FILES = /bower_components/font-mfizz/css/font-mfizz.css \
	        /bower_components/font-awesome/css/font-awesome.min.css \
	        /bower_components/octicons/octicons/octicons.css \
            /bower_components/bootstrap/dist/css/bootstrap.min.css \
            /bower_components/bootstrap-material-design/dist/css/material.min.css \
	        /assets/css/styles.css

export PATH := 	./node_modules/.bin:$(PATH);

all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_FINAL_DIR)
	rm -rf $(BUILD_TMP_DIR)
	rm -rf $(BUILD_BACKUP_DIR)

production: backup npm bower assets scripts jsx templates optimize move

development: npm bower assets scripts jsx templates optimize-css watch

optimize: optimize-css optimize-rjs

npm:
	npm install

optimize-css:
	mkdir -p $(BUILD_TMP_DIR)/static/css
	cleancss -o $(BUILD_TMP_DIR)/static/css/all.min.css $(addprefix $(BUILD_TMP_DIR)/static,$(CSS_FILES))

optimize-rjs:
	r.js -o $(BUILD_TMP_DIR)/static/js/build.js

scripts:
	mkdir -p $(BUILD_TMP_DIR)/static/js
	rsync -rupE $(SOURCE_DIR)/js --include="*.js" $(BUILD_TMP_DIR)/static

templates:
	mkdir -p $(BUILD_TMP_DIR)
	rsync -rupE $(SOURCE_DIR)/templates/ --include="*.html" $(BUILD_TMP_DIR)

jsx:
	jsx $(SOURCE_DIR)/js $(BUILD_TMP_DIR)/static/js -x jsx

assets:
	rsync -rupE $(SOURCE_DIR)/assets $(BUILD_TMP_DIR)/static

.PHONY: scripts

bower:
	mkdir -p $(BUILD_TMP_DIR)/static
	bower install --config.directory=$(BUILD_TMP_DIR)/static/bower_components

backup:
	@if [ ! -e $(BUILD_TMP_DIR) ]; then \
		mkdir $(BUILD_TMP_DIR); \
	fi;

watch:
	@which inotifywait || (echo "Please install inotifywait";exit 2)
	@while true ; do \
		inotifywait -r src -e create,delete,move,modify || break; \
		($(MAKE) assets scripts jsx templates) || break;\
	done

move:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_BACKUP_DIR); \
	fi;

	if [ -e $(BUILD_FINAL_DIR) -a ! $(BUILD_TMP_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_FINAL_DIR) $(BUILD_BACKUP_DIR); \
	fi;

	if [ ! $(BUILD_TMP_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_TMP_DIR) $(BUILD_FINAL_DIR); \
	fi;

rollback:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_FINAL_DIR); \
		mv $(BUILD_BACKUP_DIR) $(BUILD_FINAL_DIR); \
	fi;
