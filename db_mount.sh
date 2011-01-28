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
fi
