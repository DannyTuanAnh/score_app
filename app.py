from flask import Flask, render_template
import logging
from db.connection import close_db
from route.scores import scores_bp

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tạo Flask app với cấu hình template và static folders
app = Flask(__name__, 
            template_folder='template',
            static_folder='static')

# Cấu hình Flask
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Thay đổi trong production

# Register blueprint
app.register_blueprint(scores_bp, url_prefix='/api')

# Routes cho frontend
@app.route('/')
def index():
    """Trang chủ"""
    logger.info("Rendering index page")
    return render_template('index.html')

@app.route('/scores')
def scores_page():
    """Trang xem điểm"""
    logger.info("Rendering scores page")
    return render_template('scores.html')

@app.route('/batch-update')
def batch_update_page():
    """Trang cập nhật điểm hàng loạt"""
    logger.info("Rendering batch update page")
    return render_template('batch-update.html')

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    logger.warning(f"404 error: {error}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {error}")
    return render_template('500.html'), 500

# Đóng DB sau mỗi request
@app.teardown_appcontext
def teardown_db(exception):
    close_db(exception)

if __name__ == "__main__":
    logger.info("Starting Score Management System...")
    app.run(debug=True, host='0.0.0.0', port=5000)