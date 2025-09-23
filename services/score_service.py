import logging
import time
from datetime import datetime, timezone, timedelta
from db.connection import get_db

# Cấu hình logging
logger = logging.getLogger(__name__)

def get_score_by_class(class_id):
    logger.info(f"Fetching scores for class_id: {class_id}")
    start_time = time.time()
    
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)  # MySQL cursor với dictionary=True
        cursor.execute("SELECT scores.*, students.name FROM scores left join students on students.studentID = scores.studentID  WHERE scores.classID = %s", (class_id,))
        result = cursor.fetchall()
        
        execution_time = time.time() - start_time
        logger.info(f"Successfully fetched {len(result)} scores for class {class_id} in {execution_time:.3f}s")
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching scores for class {class_id}: {e}")
        raise

def batch_update_scores(changes):
    logger.info(f"Starting batch update for {len(changes)} score changes")
    start_time = time.time()
    
    results = []
    conflicts = []
    successful_updates = 0
    
    db = get_db()
    cursor = db.cursor()
    
    try:    
        for i, c in enumerate(changes):
            logger.debug(f"Processing update {i+1}/{len(changes)}: studentID={c['studentID']}, score={c['score']}, version={c['version']}")
            
            # Tạo timestamp hiện tại theo múi giờ Việt Nam
            vn_timezone = timezone(timedelta(hours=7))  # UTC+7
            current_time = datetime.now(vn_timezone)
            
            cursor.execute(
                "UPDATE scores SET score=%s,  version=version+1, date_update = %s WHERE studentID=%s AND version=%s",
                (c['score'], current_time, c['studentID'], c['version'])
            )
            
            if cursor.rowcount == 1:
                results.append({"studentID": c['studentID'], "status": "ok"})
                successful_updates += 1
                logger.debug(f"Successfully updated studentID {c['studentID']}")
            else:
                results.append({"studentID": c['studentID'], "status": "conflict"})
                conflicts.append(c['studentID'])
                logger.warning(f"Version conflict for studentID {c['studentID']} (expected version: {c['version']})")
        
        db.commit()
        execution_time = time.time() - start_time
        
        logger.info(f"Batch update completed: {successful_updates}/{len(changes)} successful, "
                   f"{len(conflicts)} conflicts in {execution_time:.3f}s")
        
        if conflicts:
            logger.warning(f"Conflicts detected for students: {conflicts}")
            
            
    except Exception as e:
        db.rollback()
        logger.error(f"Batch update failed, transaction rolled back: {e}")
        logger.error(f"Failed after processing {len(results)} out of {len(changes)} changes")
        raise e
    
    return results