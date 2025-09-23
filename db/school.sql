create database school;
use school ; 

CREATE TABLE students (
    studentID INT PRIMARY KEY,
    name VARCHAR(100),
    classID VARCHAR(20)
);

CREATE TABLE scores (
    studentID INT PRIMARY KEY,
    classID VARCHAR(20),
    score FLOAT,
    version INT DEFAULT 1,
    FOREIGN KEY (studentID) REFERENCES students(studentID)
);

use school;
alter table scores 
add date_update datetime;



INSERT INTO students (studentID, name, classID) VALUES
(1, 'Student01', '10A1'),
(2, 'Student02', '10A1'),
(3, 'Student03', '10A1'),
(4, 'Student04', '10A1'),
(5, 'Student05', '10A1'),
(6, 'Student06', '10A1'),
(7, 'Student07', '10A1'),
(8, 'Student08', '10A1'),
(9, 'Student09', '10A1'),
(10, 'Student10', '10A1'),
(11, 'Student11', '10A1'),
(12, 'Student12', '10A1'),
(13, 'Student13', '10A1'),
(14, 'Student14', '10A1'),
(15, 'Student15', '10A1'),
(16, 'Student16', '10A1'),
(17, 'Student17', '10A1'),
(18, 'Student18', '10A1'),
(19, 'Student19', '10A1'),
(20, 'Student20', '10A1'),
(21, 'Student21', '10A1'),
(22, 'Student22', '10A1'),
(23, 'Student23', '10A1'),
(24, 'Student24', '10A1'),
(25, 'Student25', '10A1'),
(26, 'Student26', '10A1'),
(27, 'Student27', '10A1'),
(28, 'Student28', '10A1'),
(29, 'Student29', '10A1'),
(30, 'Student30', '10A1'),
(31, 'Student31', '10A1'),
(32, 'Student32', '10A1'),
(33, 'Student33', '10A1'),
(34, 'Student34', '10A1'),
(35, 'Student35', '10A1'),
(36, 'Student36', '10A1'),
(37, 'Student37', '10A1'),
(38, 'Student38', '10A1'),
(39, 'Student39', '10A1'),
(40, 'Student40', '10A1'),
(41, 'Student41', '10A1'),
(42, 'Student42', '10A1'),
(43, 'Student43', '10A1'),
(44, 'Student44', '10A1'),
(45, 'Student45', '10A1'),
(46, 'Student46', '10A1'),
(47, 'Student47', '10A1'),
(48, 'Student48', '10A1'),
(49, 'Student49', '10A1'),
(50, 'Student50', '10A1'),
(51, 'Student51', '10A1'),
(52, 'Student52', '10A1'),
(53, 'Student53', '10A1'),
(54, 'Student54', '10A1'),
(55, 'Student55', '10A1'),
(56, 'Student56', '10A1'),
(57, 'Student57', '10A1'),
(58, 'Student58', '10A1'),
(59, 'Student59', '10A1'),
(60, 'Student60', '10A1');

use school;
UPDATE scores
SET date_update = NOW();

update scores
set version = "3"
where studentID = 1;

update scores
set version = "4", score = 8
where studentID = 2;

update scores
set version = "3"
where studentID = 2;

INSERT INTO scores (studentID, classID, score, version) VALUES
(1, '10A1', 6.4, 1),
(2, '10A1', 7.2, 1),
(3, '10A1', 8.8, 1),
(4, '10A1', 5.5, 1),
(5, '10A1', 8.1, 1),
(6, '10A1', 6.1, 1),
(7, '10A1', 6.6, 1),
(8, '10A1', 5.4, 1),
(9, '10A1', 8.8, 1),
(10, '10A1', 5.6, 1),
(11, '10A1', 4.9, 1),
(12, '10A1', 8.7, 1),
(13, '10A1', 5.4, 1),
(14, '10A1', 7.0, 1),
(15, '10A1', 7.0, 1),
(16, '10A1', 7.6, 1),
(17, '10A1', 6.2, 1),
(18, '10A1', 8.7, 1),
(19, '10A1', 8.0, 1),
(20, '10A1', 6.0, 1),
(21, '10A1', 6.2, 1),
(22, '10A1', 7.3, 1),
(23, '10A1', 5.6, 1),
(24, '10A1', 8.9, 1),
(25, '10A1', 6.0, 1),
(26, '10A1', 6.4, 1),
(27, '10A1', 4.7, 1),
(28, '10A1', 5.8, 1),
(29, '10A1', 6.4, 1),
(30, '10A1', 8.0, 1),
(31, '10A1', 6.5, 1),
(32, '10A1', 9.7, 1),
(33, '10A1', 6.4, 1),
(34, '10A1', 9.9, 1),
(35, '10A1', 4.8, 1),
(36, '10A1', 6.7, 1),
(37, '10A1', 9.8, 1),
(38, '10A1', 9.7, 1),
(39, '10A1', 4.9, 1),
(40, '10A1', 6.8, 1),
(41, '10A1', 9.2, 1),
(42, '10A1', 6.5, 1),
(43, '10A1', 8.6, 1),
(44, '10A1', 5.7, 1),
(45, '10A1', 8.6, 1),
(46, '10A1', 5.4, 1),
(47, '10A1', 8.8, 1),
(48, '10A1', 8.5, 1),
(49, '10A1', 9.8, 1),
(50, '10A1', 9.1, 1),
(51, '10A1', 7.2, 1),
(52, '10A1', 8.7, 1),
(53, '10A1', 7.3, 1),
(54, '10A1', 7.1, 1),
(55, '10A1', 6.8, 1),
(56, '10A1', 8.0, 1),
(57, '10A1', 5.9, 1),
(58, '10A1', 4.0, 1),
(59, '10A1', 7.6, 1),
(60, '10A1', 6.3, 1);
