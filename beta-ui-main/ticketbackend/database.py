import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()
h = os.getenv("MYSQL_HOST")
u = os.getenv("MYSQL_USER")
p = os.getenv("MYSQL_PASSWORD")
d = os.getenv("MYSQL_DB")
def get_connection():
    return mysql.connector.connect(
        host=h,
        user=u,
        password=p,
        database=d if d else "ticket2"
    )
