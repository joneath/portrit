#!/bin/bash

DATABASE_NAME="portrit"
DATABASE_USER="root"
DATABASE_PASSWORD=""
MYSQL_BIN_FOLDER="/usr/bin"
SQL_BACKUP_FILE=""
DATETIME=`date +%s-%e-%m-%y`

echo "-Running Database Backup-" | tee -a $LOG_FILE
cd /var/www/portrit/backup 
`$MYSQL_BIN_FOLDER/mysqldump -u $DATABASE_USER -h localhost $DATABASE_NAME > $DATETIME.sql`
SQL_BACKUP_FILE=`pwd`'/'$DATETIME'.sql'
cd ..

s3cmd put $SQL_BACKUP_FILE s3://portrit_backup