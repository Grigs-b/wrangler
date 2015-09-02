from django.conf import settings
import imaplib, email, quopri, re, itertools, datetime
from .models import Project, Developer, Status
from bs4 import BeautifulSoup

def search_string(date):
    dateformatted = date.strftime('%Y.%-m.%-d') #note: this dateformat will not work on Windows.
    status_subject = '(SUBJECT \"[iOS Status {dateformatted}]\")'.format(dateformatted=dateformatted)
    return status_subject

class EmailParser():
	
	def __init__(self, sender, body):
		self.sender = sender
		self.body = body


class IMAPClient():
	def __init__(self, connection=None):
		self.connection = connection if connection else imaplib.IMAP4_SSL('imap.gmail.com')

	def login(self, user, auth):
		self.connection.login(user, auth)
		response, mailboxes = self.connection.list()
		print(response, mailboxes)

	def logout(self):
		try:
			self.connection.close()
		except:
			pass
		self.connection.logout()

	def status_emails(self, date):
		response, count = self.connection.select("INBOX")
		print(response, count)
		search = search_string(date)
		result, data = self.connection.search(None, search)
		if not data:
			print('no data found in search')
			return None

		statuses = []
		for email_id in data[0].split():
			response, message_data = self.connection.fetch(email_id, '(BODY.PEEK[TEXT])')

			message = ""
			for response_part in message_data:
				if isinstance(response_part, tuple):
					body = email.message_from_string(response_part[1]) # body

					if body.is_multipart():
						for payload in body.get_payload():
							message += quopri.decodestring(payload)
					else:
						message = quopri.decodestring(body.get_payload())

			response, headers_data = self.connection.fetch(email_id, '(RFC822)')
			headers = email.message_from_string(headers_data[0][1])
			statuses.append({ "from": headers['FROM'], "body": message })

		return statuses

# DEVELOPER METHODS
EMAIL_REGEX = r'[<]([^>]+)[>]'
def get_email_from_sender(sender):

	email = sender
	match = re.search(EMAIL_REGEX, sender)
	if match:
		email = match.group(1)

	return email

def save_developer(email):
	# add if we dont exist
	if not Developer.objects.filter(email=email).first():
		names = email.split('.')
		first_name = ""
		last_name = ""
		if len(names) > 1:
			first_name = names[0]
			last_name = names[1].split('@')[0]

		dev = Developer(email=email, first_name=first_name, last_name=last_name)
		dev.save()



# PROJECT / STATUS METHODS
def get_start_of_message_index(body):
	index = max()

EMAIL_ON_DATE_REGEX = r'On (Mon|Tue|Wed|Thu|Fri|Sat|Sun), [A-Za-z]{3} [0-9]{1,2}, [0-9]{4} at [0-9]{1,2}:[0-9]{2} (AM|PM)'

def get_body_text_from_message(message_body):
	lines = message_body.split('\r\n')
	clean_lines = []
	for line in lines:
		line = line.decode('utf-8').encode('ascii', 'ignore')
		if line.startswith('--') or 'charset=' in line.lower() \
			or line.lower().startswith('content-type') or line.lower().startswith('content-transfer') \
			or line.lower().startswith('content-disposition'):
			#headers we don't care about, push onward
			continue
		elif line.startswith('<html>'):
			#we have the html body, take it and RUN
			return line
		elif line.startswith('>') or line.endswith('> wrote:'):
			#once we start getting into replies, everything past then is garbo
			break
		elif re.search(EMAIL_ON_DATE_REGEX, line):
			break
		elif len(line) > 0:
			clean_lines.append(line)
	return "\n".join(clean_lines)

def parse_html_status(text):
	soup = BeautifulSoup(text, 'html.parser')
	project_names = [b.string for b in soup.find_all('b') if b.string]

	statuses = [status.string.encode('ascii', 'ignore') for status in soup.find_all('div') if status.string and status.string not in project_names]
	print('-------------------')
	print(project_names)
	print('-------------------')
	print(statuses)
	print('-------------------')
	return itertools.izip_longest(project_names, statuses, fillvalue='Unknown')

def parse_plaintext_status(text):
	lines = text.split('\n')
	current_project = "Unknown"
	project_statuses = {}
	for line in lines:
		match = re.match(r'\s*\*([A-Za-z: ]+)\*', line)
		status = line
		if match:
			# group(1) contains only the project name, with possible :
			project = match.group(1).replace(':', '')
			current_project = project
			# group(0) contains the entire matched string, not just the group
			status = line.replace(match.group(0), '').lstrip(':').encode('ascii', 'ignore')

		
		if status:
			if current_project not in project_statuses.keys():
				project_statuses[current_project] = status
			else:
				project_statuses[current_project] += status


	return project_statuses.items()

def tryparse_projects_and_statuses(text):
	if text.startswith('<html>'):
		return parse_html_status(text)
	else:
		return parse_plaintext_status(text)

def load_status_emails_for_date(date):
	#load messages
	client = IMAPClient()
	client.login(settings.GMAIL_ACCOUNT, settings.GMAIL_AUTH)
	messages = client.status_emails(date)
	client.logout()
	statuses = []
	for message in messages:
		#parse developers
		sender = message['from']
		email = get_email_from_sender(sender)
		save_developer(email)

		#parse projects / statuses
		body = message['body']
		projects_status = get_body_text_from_message(body)
		#should be a collection of project, status tuples
		parsed = tryparse_projects_and_statuses(projects_status)
		
		for project, status in parsed:
			print('PROJECT', project, 'STATUS', status)
			developer = Developer.objects.filter(email=email).first()
			project, created = Project.objects.get_or_create(name=project)
			project.save()
			s, created = Status.objects.get_or_create(developer=developer, project=project, status=status, date=date)
			s.save()
			statuses.append(s)
		
	return statuses