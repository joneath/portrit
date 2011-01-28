#!/bin/bash

if ps ax | grep -v grep | grep "mysqld" > /dev/null
then
	echo "MySQL service is running, everything is fine"
else
	mount /dev/sdf /data
	mount /etc/mysql
	mount /var/lib/mysql
	mount /var/log/mysql
	/etc/init.d/mysqld start 
	mail -s " Portrit MySQL Failed" jerrylin86@gmail.com portritinc@gmail.com < /var/www/email/db_mount_message.txt
fi
