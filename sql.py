import mysql.connector

#CREATE MYSQL
#------------------------------------------------------------------------------
mydb = mysql.connector.connect(
    host='database-projectx-1-0.ctsu2n36dxrk.eu-central-1.rds.amazonaws.com',
    user='admin',
    password='ProjectX2023.',
    port = '3306',
    database = 'projectx')
mycursor = mydb.cursor()

delete_table = 'DROP TABLE registration_token'
#delete_db = 'DROP DATABASE projectx'
#delete_table_entries = 'TRUNCATE TABLE User'
#create_db = 'CREATE DATABASE IF NOT EXISTS projectx'
#create_table = 'CREATE TABLE RegistrationToken'

mycursor.execute(delete_table)

# curl ifconfig.me
# sudo apt-get update
# sudo apt-get install mysql-client
# mysql -h database-projectx-1-0.ctsu2n36dxrk.eu-central-1.rds.amazonaws.com -u admin -p

#for db in mycursor:
    #print(db)

#-------------------------------------------------------------------------------
