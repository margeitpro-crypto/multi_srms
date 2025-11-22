-- Anonymized data for pre-production testing
-- Generated on 2025-11-22T00:46:41.110Z

-- Schools
DELETE FROM schools;
INSERT INTO schools (id, iemis_code, name, logo_url, municipality, estd, prepared_by, checked_by, head_teacher_name, head_teacher_contact, email, status, subscription_plan) VALUES (1, 'IEMIS548934', 'Test School 7424', 'https://picsum.photos/seed/school/100', 'Test Municipality 2', '2020 BS', 'Dipesh Adhikari', 'Anish Chaudhary', 'Ramesh Sharma', '9848244313', 'school1.4144@sample.com', 'Active', 'Basic');

-- Students
DELETE FROM students;
INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES ('S1001', 1, 'Sabina Poudel', '2005-05-01', 'Male', '11', '100', 'https://picsum.photos/seed/student0/100', 2080, '0160001A', 'A', '77035001', '2062-02-01', 'Bikash Poudel', 'Sabina Poudel', '9823825200');
INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES ('S1002', 1, 'Manish Rana', '2005-05-02', 'Female', '11', '101', 'https://picsum.photos/seed/student1/100', 2080, '0160002A', 'B', '77035002', '2062-02-02', 'Manish Rana', 'Gita Rana', '9866559697');
INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES ('TEST001', 1, 'Manisha Poudel', '2005-05-15', 'Male', '11', '999', '', 2082, 'TEST001A', 'A', 'REGTEST001', '2062-02-02', 'Dipesh Poudel', 'Rita Poudel', '9848516465');
INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES ('TEST1763771919878', 1, 'Manish KC', '2005-05-15', 'Male', '11', '999', '', 2082, 'TEST1763771919878A', 'A', 'REGTEST1763771919878', '2062-02-02', 'Santosh KC', 'Sarita KC', '9860207493');
INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES ('TEST1763771956080', 1, 'Sabina Singh', '2005-05-15', 'Male', '11', '999', '', 2082, 'TEST1763771956080A', 'A', 'REGTEST1763771956080', '2062-02-02', 'Bikash Singh', 'Manisha Singh', '9848767138');

-- Subjects
DELETE FROM subjects;
