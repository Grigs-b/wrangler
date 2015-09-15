Wrangler
=================

Wrangler is a Django webserver that integrates with React.js to provide a service for parsing iOS status emails and displaying them in a friendly way to people who don't feel like checking their emails.




Running
=================
Note: it is always recommended that you use a virtual environment for running or developing python applications.

###Environment
Currently uses two environment variables for authenticating to IMAP
* `GMAIL_ACCOUNT` - gmail account that has access to dev emails
* `GMAIL_AUTH` - gmail account password

*Linux Installs*
Sometimes you need additional packages for pip install to work, run your linux versions flavor of the following:
`sudo apt-get install libssl-dev python-dev libffi-dev gcc`

To run the webservice, activate your virtual environment and pip install the requirements located in the server directory.
`pip install -r requirements.txt`

Then run with `python manage.py runserver`


###Routes currently supported:
* / - Base Route, loads the grid of statuses
* /admin/ - admin panel
* /status/ - get todays status
* /status/YYYY/MM/DD/ - get status for YYYY-MM-DD


Development
=================

##Django

Pip install the requirements and run the server as above. The server will automatically reload on detecting changes.

##React

Using React+Griddle with Gulp to display the iOS Team status

Files and package.json are located within the static directory.

Use `npm install` in the directory with the package.json to install the dependencies for this project.

Run `gulp` to build the main script and set up the watch task that will check for changes in the source files.


Nginx
=================
```
sudo cp /webapps/django/wrangler/deploy/wrangler-nginx.conf /etc/nginx/sites-available/wrangler
sudo ln -s /etc/nginx/sites-available/wrangler /etc/nginx/sites-enabled/wrangler
```

Supervisor
=================
```
sudo apt-get install supervisor -y
sudo cp /webapps/django/deploy/supervisor.conf /etc/supervisor/conf.d/wrangler.conf
mkdir -p /webapps/django/logs/
touch /webapps/django/logs/gunicorn_supervisor.log 
```