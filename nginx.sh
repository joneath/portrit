#!/bin/sh

SERVICE='nginx'

if ps ax | grep -v grep | grep $SERVICE > /dev/null
then
	echo "Nginx service is running, everything is fine"
else
	/etc/init.d/nginx start 
	mail -s " Portrit Nginx Failed" jerrylin86@gmail.com portritinc@gmail.com < /var/www/email/nginx_message.txt
fi