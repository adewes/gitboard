from flask import (Flask,
                   make_response,
                   redirect,
                   render_template,
                   request)

import os

project_path = os.path.dirname(__file__)

app = Flask(
    __name__,
    static_folder=os.path.join(project_path,'build/static'),
    static_url_path='/static',
    template_folder='src/templates',
)

@app.route('/',defaults = {'path' : ''})
@app.route('/<path:path>')
def webapp(path):
    context = {}
    return make_response(render_template("index.html", **context))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000,threaded = False)
