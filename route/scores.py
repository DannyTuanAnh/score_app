from flask import Blueprint, request, jsonify
import logging
from services.score_service import get_score_by_class, batch_update_scores

# Cấu hình logging
logger = logging.getLogger(__name__)

scores_bp = Blueprint("scores", __name__)

@scores_bp.route("/scores/<class_id>", methods=["GET"])
def get_scores(class_id):
    """API endpoint để lấy điểm theo lớp"""
    try:
        logger.info(f"Getting scores for class: {class_id}")
        scores = get_score_by_class(class_id)
        logger.info(f"Successfully retrieved {len(scores)} scores for class {class_id}")
        return jsonify(scores)
    except Exception as e:
        logger.error(f"Error getting scores for class {class_id}: {e}")
        return jsonify({"error": "Không thể lấy dữ liệu điểm"}), 500

@scores_bp.route("/batch-update", methods=["POST"])
def batch_update():
    """API endpoint để cập nhật điểm hàng loạt"""
    try:
        data = request.get_json()
        
        if not data or 'changes' not in data:
            logger.warning("Invalid request data for batch update")
            return jsonify({"error": "Dữ liệu không hợp lệ"}), 400
        
        changes = data['changes']
        
        
        if not isinstance(changes, list):
            logger.warning("Changes data is not a list")
            return jsonify({"error": "Dữ liệu thay đổi phải là một mảng"}), 400
        
        if len(changes) == 0:
            logger.warning("Empty changes list")
            return jsonify({"error": "Danh sách thay đổi không được rỗng"}), 400
        
        logger.info(f"Processing batch update for {len(changes)} changes")
        results = batch_update_scores(changes)
        
        success_count = len([r for r in results if r.get('status') == 'ok'])
        conflict_count = len([r for r in results if r.get('status') == 'conflict'])
        
        logger.info(f"Batch update completed: {success_count} success, {conflict_count} conflicts")
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error in batch update: {e}")
        return jsonify({"error": "Không thể thực hiện cập nhật điểm"}), 500

# Health check endpoint
@scores_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Score service is running"
    })
