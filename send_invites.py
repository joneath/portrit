import os
import sys
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from settings import BASE_URL, MEDIA_URL
from main.models import Email_Invite

def send_invites():
    count = 0
    try:
        count = sys.argv[1]
    except:
        pass

    invites = Email_Invite.objects.filter(invited=False).order_by('created_date')[:count]
    
    messages = [ ]
    subject = 'Welcome to the Portrit preview!'
    html_content =  '<p>We are happy to announce the launch of the Portrit preview</p>' \
                    '<a href="http://portrit.com/">' \
                        '<img src="http://portrit.com/site_media/img/invite/invite.jpg"/>' \
                    '</a>' \
                    '<p>Please go to <a href="http://portrit.com">portrit.com</a> and login with the email address this message was sent to.</p>' \
                    '<p>With great power comes great responsibilty. With this in mind, we ask that you help us with any feedback you may have.<br>You can email us at <a href="mailto:feedback@portrit.com">feedback@portrit.com</a> or use the built in feedback control at the top of Portrit.</p>' \
                    '<br><br>' \
                    '<p style="color: #aeaeae; text-align: center; font-size: 12px;">You are receiving this email because you asked to receive an invite to portrit.com<br>' \
                    'Note: This email address is for distribution purposes only. Please do not reply to this email because your message will not be received.</p>'
    from_email = 'no-reply@portrit.com'
    from django.core.mail import SMTPConnection
    from django.core import mail
    connection = SMTPConnection()
    # Manually open the connection
    connection.open()
                              
    for invite in invites:
        email = mail.EmailMessage(subject, html_content, from_email,
                                    [invite.email], connection=connection)
        email.content_subtype = "html"
        messages.append(email)
        invite.invited = True
        invite.save()
    
    connection.send_messages(messages)
    connection.close()
        

if __name__ == '__main__':
    send_invites()