from middleware.standardexception import StandardExceptionMiddleware, _get_traceback
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

class HTMLMailExceptionMiddleware(StandardExceptionMiddleware):
    def log_exception(self, request, exception, exc_info):
        debug_response = self.debug_500_response(request, exception, exc_info)

        subject, message = self.exception_email(request, exc_info)

        try:
            message_prefix = "An error occured on plantlust.com.\n\nThe full text of the error is below.\n\n"
            message = message_prefix + message
        except:
            message_prefix = ""            

        msg = EmailMultiAlternatives(settings.EMAIL_SUBJECT_PREFIX + subject,
                                     message,
                                     settings.SERVER_EMAIL,
                                     [a[1] for a in settings.ADMINS])

        msg.attach_alternative(message_prefix + debug_response.content, 'text/html')
        msg.send(fail_silently=True)