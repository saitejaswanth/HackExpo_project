MERGE INTO users KEY(username) VALUES ('faculty','faculty123','FACULTY');
MERGE INTO users KEY(username) VALUES ('management','admin123','MANAGEMENT');
MERGE INTO users KEY(username) VALUES ('A101','student123','STUDENT');
MERGE INTO users KEY(username) VALUES ('A102','student123','STUDENT');
MERGE INTO students KEY(roll_no) VALUES ('A101','Akhil','CSE','B',3,84,46,41,94,60000,52000);
MERGE INTO students KEY(roll_no) VALUES ('A102','Ananya','AIDS','A',3,82,72,80,75,60000,60000);
MERGE INTO students KEY(roll_no) VALUES ('A103','Arjun','CSE','A',3,68,55,60,58,60000,45000);
MERGE INTO students KEY(roll_no) VALUES ('A104','Bharat','AIDS','B',3,52,40,48,50,60000,30000);
MERGE INTO students KEY(roll_no) VALUES ('A105','Bhavya','CSE','A',3,91,88,90,85,60000,60000);
MERGE INTO students KEY(roll_no) VALUES ('A106','Chandana','AIDS','A',3,87,78,82,80,60000,58000);
MERGE INTO students KEY(roll_no) VALUES ('A107','Charan','CSE','B',3,64,50,52,61,60000,40000);
MERGE INTO students KEY(roll_no) VALUES ('A108','Deepika','AIDS','A',3,78,70,74,69,60000,60000);
DELETE FROM timetable;
INSERT INTO timetable(day,slot,subject,faculty,room) VALUES
('Mon','9:00','Math','Dr. Rao','101'),('Mon','10:00','Programming','Prof. Kumar','103'),
('Tue','9:00','DBMS','Dr. Iyer','102'),('Tue','10:00','Data Structures','Prof. Kumar','103'),
('Tue','11:15','Lab','Ms. Divya','104'),('Tue','1:30','Mentoring','Dr. Nair','105'),('Tue','2:30','Math','Dr. Rao','101');
