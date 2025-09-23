import mysql.connector
import logging
from config import MYSQL_CONFIG
from flask import g

# Cấu hình logging
logger = logging.getLogger(__name__)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        try:
            db = g._database = mysql.connector.connect(**MYSQL_CONFIG)
            logger.info(f"MySQL connection established to {MYSQL_CONFIG['database']}")
        except mysql.connector.Error as e:
            logger.error(f"Failed to connect to MySQL database {MYSQL_CONFIG['database']}: {e}")
            raise
    return db

def close_db(e=None):
    db = getattr(g, '_database', None)
    if db is not None:
        try:
            db.close()
            logger.info("MySQL connection closed")
        except mysql.connector.Error as error:
            logger.error(f"Error closing MySQL connection: {error}")
    
    # Log nếu có exception được truyền vào
    if e is not None:
        logger.error(f"Database closed due to error: {e}")