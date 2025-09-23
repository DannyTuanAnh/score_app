# Score Management System

## Tổng quan

Score Management System là một ứng dụng web được phát triển bằng Flask để quản lý điểm số học sinh. Hệ thống hỗ trợ xem điểm theo lớp và cập nhật điểm hàng loạt với cơ chế phát hiện xung đột dữ liệu.

## Công nghệ sử dụng

- **Backend**: Flask (Python)
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Logging**: Python logging module

## Cấu trúc dự án

```
score_app/
├── app.py                 # File chính khởi tạo Flask app
├── config.py             # Cấu hình database
├── requirements.txt      # Dependencies (cần tạo)
├── README.md            # Documentation
├── db/
│   ├── connection.py    # Quản lý kết nối database
│   └── school.sql       # Script tạo database và sample data
├── route/
│   └── scores.py        # API endpoints cho điểm số
├── services/
│   └── score_service.py # Business logic xử lý điểm
├── static/
│   ├── css/
│   │   └── style.css    # Stylesheet
│   └── js/
│       ├── main.js      # JavaScript chung
│       └── scores.js    # JavaScript cho quản lý điểm
└── template/
    ├── base.html        # Template gốc
    ├── index.html       # Trang chủ
    ├── scores.html      # Trang xem điểm
    ├── 404.html         # Trang lỗi 404
    └── 500.html         # Trang lỗi 500
```

## Tính năng chính

### 1. Xem điểm theo lớp

- API endpoint: `GET /api/scores/<class_id>`
- Truy vấn điểm số của tất cả học sinh trong một lớp
- Kết hợp dữ liệu từ bảng `scores` và `students`

### 2. Cập nhật điểm hàng loạt

- API endpoint: `POST /api/batch-update`
- Cập nhật nhiều điểm số cùng lúc
- **Cơ chế phát hiện xung đột**: Sử dụng version control để tránh ghi đè dữ liệu
- Trả về kết quả chi tiết (thành công/xung đột) cho từng bản ghi

### 3. Giao diện web

- Trang chủ giới thiệu hệ thống
- Trang xem điểm với giao diện thân thiện
- Responsive design với Bootstrap

### 4. Logging và Error Handling

- Logging chi tiết cho tất cả operations
- Error handlers cho 404 và 500
- Health check endpoint: `GET /api/health`

## Database Schema

### Bảng `students`

```sql
CREATE TABLE students (
    studentID INT PRIMARY KEY,
    name VARCHAR(100),
    classID VARCHAR(20)
);
```

### Bảng `scores`

```sql
CREATE TABLE scores (
    studentID INT PRIMARY KEY,
    classID VARCHAR(20),
    score FLOAT,
    version INT DEFAULT 1,
    date_update DATETIME,
    FOREIGN KEY (studentID) REFERENCES students(studentID)
);
```

## Cài đặt và chạy ứng dụng

### 1. Yêu cầu hệ thống

- Python 3.7+
- MySQL Server
- Các package Python: Flask, mysql-connector-python

### 2. Thiết lập database

```bash
# Chạy script SQL để tạo database và sample data
mysql -u root -p < db/school.sql
```

### 3. Cấu hình database

Cập nhật thông tin kết nối MySQL trong `config.py`:

```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'school',
    'port': 3306,
    'charset': 'utf8mb4',
    'autocommit': True
}
```

### 4. Cài đặt dependencies

```bash
pip install flask mysql-connector-python
```

### 5. Chạy ứng dụng

```bash
python app.py
```

Ứng dụng sẽ chạy tại: `http://localhost:5000`

## API Documentation

### GET /api/scores/{class_id}

Lấy danh sách điểm của một lớp

**Response:**

```json
[
  {
    "studentID": 1,
    "classID": "10A1",
    "score": 8.5,
    "version": 1,
    "date_update": "2024-01-01 10:00:00",
    "name": "Student01"
  }
]
```

### POST /api/batch-update

Cập nhật điểm hàng loạt

**Request Body:**

```json
{
  "changes": [
    {
      "studentID": 1,
      "score": 9.0,
      "version": 1
    }
  ]
}
```

**Response:**

```json
[
  {
    "studentID": 1,
    "status": "ok"
  }
]
```

### GET /api/health

Health check endpoint

**Response:**

```json
{
  "status": "ok",
  "message": "Score service is running"
}
```

## Cơ chế Version Control

Hệ thống sử dụng optimistic locking để tránh xung đột dữ liệu:

- Mỗi bản ghi điểm có một `version` number
- Khi cập nhật, client phải gửi kèm version hiện tại
- Nếu version không khớp, cập nhật bị từ chối (conflict)
- Version tự động tăng sau mỗi lần cập nhật thành công

## Logging

Hệ thống ghi log chi tiết bao gồm:

- Thời gian thực hiện các truy vấn database
- Số lượng bản ghi được xử lý
- Chi tiết lỗi và exceptions
- Performance metrics

## Bảo mật

- Sử dụng parameterized queries để tránh SQL injection
- Error handling không expose thông tin nhạy cảm
- Connection pooling và proper resource cleanup

## Phát triển tiếp theo

- [ ] Authentication và authorization
- [ ] Unit tests
- [ ] API rate limiting
- [ ] Database migration scripts
- [ ] Docker containerization
- [ ] Caching layer (Redis)
- [ ] Real-time updates với WebSocket
