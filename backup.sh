#!/bin/bash

DATABASE_NAME=""
DATABASE_USER="root"
DATABASE_PASSWORD=""
MYSQL_BIN_FOLDER="/usr/bin"
SQL_BACKUP_FILE=""
DATETIME=`date +%s-%e-%m-%y`

echo "-Running Database Backup-" | tee -a $LOG_FILE
cd sql 
`$MYSQL_BIN_FOLDER/mysqldump -u $DATABASE_USER -h localhost -p$DATABASE_PASSWORD $DATABASE_NAME > $DATETIME.sql`
SQL_BACKUP_FILE=`pwd`'/'$DATETIME'.sql'
cd ..