#!/bin/sh

SERVICE='httpd'

if ps ax | grep -v grep | grep -v "httpd.sh" | grep $SERVICE > /dev/null
then
	echo "Apache service is running, everything is fine"
else
	/etc/init.d/httpd start 
	mail -s "Portrit Apache Failed" jerrylin86@gmail.com portritinc@gmail.com < /var/www/email/httpd_message.txt
fi
