#!/bin/sh

if ps ax | grep -v grep | grep "nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf" < /dev/null
then
	echo "Nginx service is running, everything is fine"
else
	/etc/init.d/nginx start 
	mail -s " Portrit Nginx Failed" jerrylin86@gmail.com portritinc@gmail.com < /var/www/email/nginx_message.txt
fi
