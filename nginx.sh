#!/bin/bash

if ps ax | grep -v grep | grep "nginx" 
then
	echo "Nginx service is running, everything is fine"
else
	/etc/init.d/nginx start 
	mail -s " Portrit Nginx Failed" jerrylin86@gmail.com portritinc@gmail.com < /var/www/email/nginx_message.txt
fi
