import mysql.connector

#CREATE MYSQL
#------------------------------------------------------------------------------

mydb = mysql.connector.connect(
    host='projectx3.cj6fxzhtmztu.eu-central-1.rds.amazonaws.com',
    user='admin',
    password='ProjectX2023.',
    port = '3306',
    database = 'projectx3')
mycursor = mydb.cursor()


delete_table = 'DROP TABLE template_time_requirement'
#delete_db = 'DROP DATABASE projectx'
#delete_table_entries = 'TRUNCATE TABLE opening_hours'
#create_db = 'CREATE DATABASE IF NOT EXISTS projectx'
#create_table = 'CREATE TABLE RegistrationToken'

mycursor.execute("ALTER TABLE solver_requirement ADD COLUMN time_per_deployment INTEGER;")


# curl ifconfig.me
# sudo apt-get update
# sudo apt-get install mysql-client
# mysql -h projectx4.cnoaam4bktuu.eu-central-1.rds.amazonaws.com -u admin -p

# npm install axios
# yarn add axios

#for db in mycursor:
    #print(db)

#-------------------------------------------------------------------------------

