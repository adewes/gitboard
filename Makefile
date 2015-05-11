#!/bin/bash

## Copyright (c) 2015 - Andreas Dewes
##
## This file is part of Gitboard.
##
## Gitboard is free software: you can redistribute it and/or modify
## it under the terms of the GNU Affero General Public License as
## published by the Free Software Foundation, either version 3 of the
## License, or (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program. If not, see <http://www.gnu.org/licenses/>.

BUILD_DIR=build
SOURCE_DIR=src

CSS_FILES = /bower_components/font-mfizz/css/font-mfizz.css \
	        /bower_components/font-awesome/css/font-awesome.min.css \
	        /bower_components/octicons/octicons/octicons.css \
            /bower_components/bootstrap/dist/css/bootstrap.min.css \
            /bower_components/bootstrap-material-design/dist/css/material.min.css \
	        /assets/css/styles.css

export PATH := 	./node_modules/.bin:$(PATH);

ifeq ($(ENVIRONMENT),production)
	BUILD_ENVIRONMENT=production
else
	BUILD_ENVIRONMENT=development
endif

all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_DIR)

production: backup npm bower assets scripts jsx templates optimize

development: npm bower assets scripts jsx templates optimize-css watch

optimize: optimize-css optimize-rjs

npm:
	npm install

optimize-css:
	mkdir -p $(BUILD_DIR)/static/css
	cleancss -o $(BUILD_DIR)/static/css/all.min.css $(addprefix $(BUILD_DIR)/static,$(CSS_FILES))

optimize-rjs:
	r.js -o $(BUILD_DIR)/static/js/build.js

scripts:
	mkdir -p $(BUILD_DIR)/static/js
	rsync -rupE $(SOURCE_DIR)/js --include="*.js" $(BUILD_DIR)/static

templates:
	mkdir -p $(BUILD_DIR)
	rsync -rupE $(SOURCE_DIR)/templates/ --include="*.html" $(BUILD_DIR)

jsx:
	jsx $(SOURCE_DIR)/js $(BUILD_DIR)/static/js -x jsx

assets:
	rsync -rupE $(SOURCE_DIR)/assets $(BUILD_DIR)/static

.PHONY: scripts

bower:
	mkdir -p $(BUILD_DIR)/static
	bower install --config.directory=$(BUILD_DIR)/static/bower_components

watch:
	@which inotifywait || (echo "Please install inotifywait";exit 2)
	@while true ; do \
		inotifywait -r src -e create,delete,move,modify || break; \
		($(MAKE) assets scripts jsx templates) || break;\
	done
