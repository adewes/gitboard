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

CSS_FILES = /css/main.css

export PATH := 	./node_modules/.bin:$(PATH);

ifeq ($(ENVIRONMENT),production)
	BUILD_ENVIRONMENT=production
else
	BUILD_ENVIRONMENT=development
endif

ifeq ($(NAVIGATION),html5)
	ENV_SETTINGS=settings_html5_navigation.js
else
	ENV_SETTINGS=settings_hashtag_navigation.js
endif

all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_DIR)

production: npm bower assets scripts jsx templates env_settings scss optimize

development: npm bower assets scripts jsx templates env_settings scss watch

optimize: optimize-css optimize-rjs

npm:
	npm install

scss: $(SOURCE_DIR)/scss/main.scss
	mkdir -p $(BUILD_DIR)/static/css
	scss $(SOURCE_DIR)/scss/main.scss $(BUILD_DIR)/static/css/main.css

env_settings:
	cp $(SOURCE_DIR)/js/$(ENV_SETTINGS) $(BUILD_DIR)/static/js/env_settings.js

optimize-css:
	mkdir -p $(BUILD_DIR)/static/css
	cleancss -o $(BUILD_DIR)/static/css/main.css $(addprefix $(BUILD_DIR)/static,$(CSS_FILES))

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
		($(MAKE) assets scripts jsx templates scss) || break;\
	done
