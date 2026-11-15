-- ==============================================================================
-- GREMS  -  Government Recruitment Examination Management System
-- DBMS LABORATORY : SQL QUERIES  (database/queries/queries.sql)
-- ==============================================================================
-- Format follows the lab manual:  Problem statement -> SOLUTIONS
-- (CREATE TABLE, INSERT, SELECT * with output) -> every query with its output.
--
-- DATABASE      : PostgreSQL 15+ (tested on PostgreSQL 16)
-- HOW TO RUN    : psql / pgAdmin / DBeaver  ->  run the complete file once.
--                 Supabase SQL Editor shows only the LAST result of a script,
--                 so run query by query and select  SET search_path TO grems_lab;
--                 together with the query you run.
-- SAFE TO RUN   : Everything is created inside a separate schema called
--                 grems_lab. The real GREMS tables are never touched. The file
--                 can be re-run any number of times (it drops grems_lab first).
-- NOTE          : The lab tables use the same table and column names as the
--                 real database (database/schema/create_tables.sql) but use
--                 short readable ids ('C1', 'E1', 'X1' ...) instead of UUIDs
--                 and leave out the Supabase auth table, exactly like the
--                 manual uses 'B1', 'C1' in the Bank database.
-- INTENTIONAL ERROR : Experiment 5, trigger test 1 raises an ERROR on purpose to
--                 prove that the trigger rejects an over-capacity allocation.
-- OUTPUT        : The result shown under each query was produced by running
--                 this file on PostgreSQL. Column names print in lowercase
--                 because PostgreSQL folds unquoted names.

DROP SCHEMA IF EXISTS grems_lab CASCADE;

CREATE SCHEMA grems_lab;

SET search_path TO grems_lab;

-- ============================================================================
-- EXPERIMENT 1 :  CANDIDATES, EXAMINATIONS, CENTERS AND APPLICATIONS
-- ============================================================================

-- 1. Consider the following schema for the GREMS Database:
--
--    CANDIDATES(Candidate_id, Candidate_number, Full_name, Date_of_birth, Gender,
--               Phone_number, City, State, Category)
--    EDUCATIONAL_QUALIFICATIONS(Qualification_id, Candidate_id, Qualification_level,
--               Institution_name, Passing_year, Percentage)
--    EXAMINATIONS(Examination_id, Examination_code, Examination_name,
--               Conducting_authority, Application_start_date, Application_end_date,
--               Examination_date, Application_fee, Total_vacancies, Examination_status)
--    EXAM_CENTERS(Center_id, Center_code, Center_name, City, State, Total_capacity)
--    EXAMINATION_CENTERS(Examination_id, Center_id, Allocated_capacity)
--    APPLICATIONS(Application_id, Application_number, Candidate_id, Examination_id,
--               Center_id, Applied_at, Application_status, Payment_status)
--    ADMIT_CARDS(Admit_card_id, Application_id, Roll_number, Issue_date, Reporting_time)
--    RESULTS(Result_id, Application_id, Marks_obtained, Maximum_marks, Percentage,
--               Rank, Result_status, Published_at)
--
--    Note: Application_status may be of following: SUBMITTED, ACCEPTED, REJECTED
--          Payment_status     may be of following: PAID, PENDING, FAILED
--
--    Write SQL queries to
--    1. Find all the candidates who have applied for at least one examination at the
--       "Mangaluru" exam center.
--    2. Find the name of the candidate who has scored the highest marks among all the
--       candidates.
--    3. Retrieve the candidate name and examination fee of the candidates who have paid
--       the application fee more than Rs. 200.
--    4. Retrieve the details of the exam center with maximum and minimum capacity among
--       the various exam centers.
--    5. Demonstrate how you delete all application tuples at every exam center located in
--       a specific city.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


CREATE TABLE CANDIDATES(
    CANDIDATE_ID      VARCHAR(10),
    CANDIDATE_NUMBER  VARCHAR(20) NOT NULL,
    FULL_NAME         VARCHAR(30) NOT NULL,
    DATE_OF_BIRTH     DATE        NOT NULL,
    GENDER            VARCHAR(10),
    PHONE_NUMBER      VARCHAR(12) NOT NULL,
    CITY              VARCHAR(20) NOT NULL,
    STATE             VARCHAR(20) NOT NULL,
    CATEGORY          VARCHAR(10),
    PRIMARY KEY(CANDIDATE_ID),
    UNIQUE(CANDIDATE_NUMBER));

INSERT INTO CANDIDATES VALUES
    ('C1','CND-2026-00101','RAHUL SHARMA','2000-05-14','MALE','9845012345','MANGALURU','KARNATAKA','GENERAL'),
    ('C2','CND-2026-00102','PRIYA PATEL','1999-11-02','FEMALE','9825098765','AHMEDABAD','GUJARAT','OBC'),
    ('C3','CND-2026-00103','AMIT KUMAR','2001-03-21','MALE','9431011223','PATNA','BIHAR','SC'),
    ('C4','CND-2026-00104','ANITA DSOUZA','2000-08-30','FEMALE','9886055667','UDUPI','KARNATAKA','GENERAL'),
    ('C5','CND-2026-00105','SUMANTH RAO','1998-01-09','MALE','9900144556','BENGALURU','KARNATAKA','OBC'),
    ('C6','CND-2026-00106','FATIMA KHAN','2002-07-17','FEMALE','9703277889','HYDERABAD','TELANGANA','GENERAL');

SELECT * FROM CANDIDATES;

-- OUTPUT:
--  candidate_id | candidate_number | full_name    | date_of_birth | gender | phone_number | city      | state     | category
-- --------------+------------------+--------------+---------------+--------+--------------+-----------+-----------+----------
--  C1           | CND-2026-00101   | RAHUL SHARMA | 2000-05-14    | MALE   | 9845012345   | MANGALURU | KARNATAKA | GENERAL
--  C2           | CND-2026-00102   | PRIYA PATEL  | 1999-11-02    | FEMALE | 9825098765   | AHMEDABAD | GUJARAT   | OBC
--  C3           | CND-2026-00103   | AMIT KUMAR   | 2001-03-21    | MALE   | 9431011223   | PATNA     | BIHAR     | SC
--  C4           | CND-2026-00104   | ANITA DSOUZA | 2000-08-30    | FEMALE | 9886055667   | UDUPI     | KARNATAKA | GENERAL
--  C5           | CND-2026-00105   | SUMANTH RAO  | 1998-01-09    | MALE   | 9900144556   | BENGALURU | KARNATAKA | OBC
--  C6           | CND-2026-00106   | FATIMA KHAN  | 2002-07-17    | FEMALE | 9703277889   | HYDERABAD | TELANGANA | GENERAL
-- (6 rows)

CREATE TABLE EDUCATIONAL_QUALIFICATIONS(
    QUALIFICATION_ID     VARCHAR(10),
    CANDIDATE_ID         VARCHAR(10) NOT NULL,
    QUALIFICATION_LEVEL  VARCHAR(15) NOT NULL,
    INSTITUTION_NAME     VARCHAR(40) NOT NULL,
    PASSING_YEAR         INT,
    PERCENTAGE           NUMERIC(5,2),
    PRIMARY KEY(QUALIFICATION_ID),
    FOREIGN KEY(CANDIDATE_ID) REFERENCES CANDIDATES(CANDIDATE_ID) ON DELETE CASCADE);

INSERT INTO EDUCATIONAL_QUALIFICATIONS VALUES
    ('Q1','C1','12TH','ST ALOYSIUS PU COLLEGE',2018,91.20),
    ('Q2','C1','BACHELORS','SAHYADRI COLLEGE OF ENGG',2022,78.50),
    ('Q3','C2','BACHELORS','GUJARAT UNIVERSITY',2021,72.40),
    ('Q4','C3','MASTERS','PATNA UNIVERSITY',2024,68.90),
    ('Q5','C4','BACHELORS','MANIPAL UNIVERSITY',2022,81.00),
    ('Q6','C5','BACHELORS','BANGALORE UNIVERSITY',2020,66.75),
    ('Q7','C6','BACHELORS','OSMANIA UNIVERSITY',2024,74.10);

SELECT * FROM EDUCATIONAL_QUALIFICATIONS;

-- OUTPUT:
--  qualification_id | candidate_id | qualification_level | institution_name         | passing_year | percentage
-- ------------------+--------------+---------------------+--------------------------+--------------+------------
--  Q1               | C1           | 12TH                | ST ALOYSIUS PU COLLEGE   | 2018         | 91.20
--  Q2               | C1           | BACHELORS           | SAHYADRI COLLEGE OF ENGG | 2022         | 78.50
--  Q3               | C2           | BACHELORS           | GUJARAT UNIVERSITY       | 2021         | 72.40
--  Q4               | C3           | MASTERS             | PATNA UNIVERSITY         | 2024         | 68.90
--  Q5               | C4           | BACHELORS           | MANIPAL UNIVERSITY       | 2022         | 81.00
--  Q6               | C5           | BACHELORS           | BANGALORE UNIVERSITY     | 2020         | 66.75
--  Q7               | C6           | BACHELORS           | OSMANIA UNIVERSITY       | 2024         | 74.10
-- (7 rows)

CREATE TABLE EXAMINATIONS(
    EXAMINATION_ID          VARCHAR(10),
    EXAMINATION_CODE        VARCHAR(20) NOT NULL,
    EXAMINATION_NAME        VARCHAR(40) NOT NULL,
    CONDUCTING_AUTHORITY    VARCHAR(20) NOT NULL,
    APPLICATION_START_DATE  DATE        NOT NULL,
    APPLICATION_END_DATE    DATE        NOT NULL,
    EXAMINATION_DATE        DATE        NOT NULL,
    APPLICATION_FEE         NUMERIC(8,2) DEFAULT 0,
    TOTAL_VACANCIES         INT         NOT NULL,
    EXAMINATION_STATUS      VARCHAR(15) NOT NULL,
    PRIMARY KEY(EXAMINATION_ID),
    UNIQUE(EXAMINATION_CODE));

INSERT INTO EXAMINATIONS VALUES
    ('E1','UPSC-CSP-2026','CIVIL SERVICES PRELIMS','UPSC','2026-02-01','2026-03-05','2026-05-24',100,979,'COMPLETED'),
    ('E2','KPSC-FDA-2026','FIRST DIVISION ASSISTANT','KPSC','2026-06-01','2026-07-15','2026-09-20',300,250,'COMPLETED'),
    ('E3','SSC-CGL-2026','COMBINED GRADUATE LEVEL','SSC','2026-10-01','2026-11-30','2027-01-18',100,1500,'OPEN'),
    ('E4','IBPS-PO-2027','PROBATIONARY OFFICER','IBPS','2027-01-10','2027-02-10','2027-04-12',850,4455,'UPCOMING');

SELECT * FROM EXAMINATIONS;

-- OUTPUT:
--  examination_id | examination_code | examination_name         | conducting_authority | application_start_date | application_end_date | examination_date | application_fee | total_vacancies | examination_status
-- ----------------+------------------+--------------------------+----------------------+------------------------+----------------------+------------------+-----------------+-----------------+--------------------
--  E1             | UPSC-CSP-2026    | CIVIL SERVICES PRELIMS   | UPSC                 | 2026-02-01             | 2026-03-05           | 2026-05-24       | 100.00          | 979             | COMPLETED
--  E2             | KPSC-FDA-2026    | FIRST DIVISION ASSISTANT | KPSC                 | 2026-06-01             | 2026-07-15           | 2026-09-20       | 300.00          | 250             | COMPLETED
--  E3             | SSC-CGL-2026     | COMBINED GRADUATE LEVEL  | SSC                  | 2026-10-01             | 2026-11-30           | 2027-01-18       | 100.00          | 1500            | OPEN
--  E4             | IBPS-PO-2027     | PROBATIONARY OFFICER     | IBPS                 | 2027-01-10             | 2027-02-10           | 2027-04-12       | 850.00          | 4455            | UPCOMING
-- (4 rows)

CREATE TABLE EXAM_CENTERS(
    CENTER_ID       VARCHAR(10),
    CENTER_CODE     VARCHAR(10) NOT NULL,
    CENTER_NAME     VARCHAR(30) NOT NULL,
    CITY            VARCHAR(20) NOT NULL,
    STATE           VARCHAR(20) NOT NULL,
    TOTAL_CAPACITY  INT         NOT NULL,
    PRIMARY KEY(CENTER_ID),
    UNIQUE(CENTER_CODE));

INSERT INTO EXAM_CENTERS VALUES
    ('X1','MNG-01','SAHYADRI EXAM HALL','MANGALURU','KARNATAKA',500),
    ('X2','BLR-01','CHRIST EXAM HALL','BENGALURU','KARNATAKA',800),
    ('X3','DEL-01','DU EXAM HALL','DELHI','DELHI',1000),
    ('X4','HYD-01','OSMANIA EXAM HALL','HYDERABAD','TELANGANA',600),
    ('X5','UDP-01','MANIPAL EXAM HALL','UDUPI','KARNATAKA',300);

SELECT * FROM EXAM_CENTERS;

-- OUTPUT:
--  center_id | center_code | center_name        | city      | state     | total_capacity
-- -----------+-------------+--------------------+-----------+-----------+----------------
--  X1        | MNG-01      | SAHYADRI EXAM HALL | MANGALURU | KARNATAKA | 500
--  X2        | BLR-01      | CHRIST EXAM HALL   | BENGALURU | KARNATAKA | 800
--  X3        | DEL-01      | DU EXAM HALL       | DELHI     | DELHI     | 1000
--  X4        | HYD-01      | OSMANIA EXAM HALL  | HYDERABAD | TELANGANA | 600
--  X5        | UDP-01      | MANIPAL EXAM HALL  | UDUPI     | KARNATAKA | 300
-- (5 rows)

CREATE TABLE EXAMINATION_CENTERS(
    EXAMINATION_ID      VARCHAR(10),
    CENTER_ID           VARCHAR(10),
    ALLOCATED_CAPACITY  INT NOT NULL,
    PRIMARY KEY(EXAMINATION_ID, CENTER_ID),
    FOREIGN KEY(EXAMINATION_ID) REFERENCES EXAMINATIONS(EXAMINATION_ID) ON DELETE CASCADE,
    FOREIGN KEY(CENTER_ID) REFERENCES EXAM_CENTERS(CENTER_ID) ON DELETE CASCADE);

INSERT INTO EXAMINATION_CENTERS VALUES
    ('E1','X1',300),
    ('E1','X2',400),
    ('E1','X3',500),
    ('E2','X1',250),
    ('E2','X2',300),
    ('E3','X1',200),
    ('E3','X2',300),
    ('E3','X4',250),
    ('E4','X3',400),
    ('E4','X5',150);

SELECT * FROM EXAMINATION_CENTERS;

-- OUTPUT:
--  examination_id | center_id | allocated_capacity
-- ----------------+-----------+--------------------
--  E1             | X1        | 300
--  E1             | X2        | 400
--  E1             | X3        | 500
--  E2             | X1        | 250
--  E2             | X2        | 300
--  E3             | X1        | 200
--  E3             | X2        | 300
--  E3             | X4        | 250
--  E4             | X3        | 400
--  E4             | X5        | 150
-- (10 rows)

CREATE TABLE APPLICATIONS(
    APPLICATION_ID      VARCHAR(10),
    APPLICATION_NUMBER  VARCHAR(20) NOT NULL,
    CANDIDATE_ID        VARCHAR(10) NOT NULL,
    EXAMINATION_ID      VARCHAR(10) NOT NULL,
    CENTER_ID           VARCHAR(10),
    APPLIED_AT          DATE        NOT NULL,
    APPLICATION_STATUS  VARCHAR(15) NOT NULL,
    PAYMENT_STATUS      VARCHAR(10) DEFAULT 'PENDING',
    PRIMARY KEY(APPLICATION_ID),
    UNIQUE(APPLICATION_NUMBER),
    UNIQUE(CANDIDATE_ID, EXAMINATION_ID),
    FOREIGN KEY(CANDIDATE_ID) REFERENCES CANDIDATES(CANDIDATE_ID) ON DELETE CASCADE,
    FOREIGN KEY(EXAMINATION_ID, CENTER_ID)
        REFERENCES EXAMINATION_CENTERS(EXAMINATION_ID, CENTER_ID) ON DELETE CASCADE);

INSERT INTO APPLICATIONS VALUES
    ('A1','APP-2026-0001','C1','E1','X1','2026-02-10','ACCEPTED','PAID'),
    ('A2','APP-2026-0002','C2','E1','X3','2026-02-12','ACCEPTED','PAID'),
    ('A3','APP-2026-0003','C3','E1','X2','2026-02-20','REJECTED','PENDING'),
    ('A4','APP-2026-0004','C1','E2','X1','2026-06-10','ACCEPTED','PAID'),
    ('A5','APP-2026-0005','C4','E2','X1','2026-06-11','ACCEPTED','PAID'),
    ('A6','APP-2026-0006','C5','E2','X2','2026-06-15','ACCEPTED','PAID'),
    ('A7','APP-2026-0007','C2','E2','X2','2026-06-20','ACCEPTED','PAID'),
    ('A8','APP-2026-0008','C1','E3','X1','2026-10-05','SUBMITTED','PAID'),
    ('A9','APP-2026-0009','C4','E3','X1','2026-10-07','SUBMITTED','PENDING'),
    ('A10','APP-2026-0010','C6','E3','X4','2026-10-09','ACCEPTED','PAID'),
    ('A11','APP-2026-0011','C3','E3','X2','2026-10-12','REJECTED','FAILED');

SELECT * FROM APPLICATIONS;

-- OUTPUT:
--  application_id | application_number | candidate_id | examination_id | center_id | applied_at | application_status | payment_status
-- ----------------+--------------------+--------------+----------------+-----------+------------+--------------------+----------------
--  A1             | APP-2026-0001      | C1           | E1             | X1        | 2026-02-10 | ACCEPTED           | PAID
--  A2             | APP-2026-0002      | C2           | E1             | X3        | 2026-02-12 | ACCEPTED           | PAID
--  A3             | APP-2026-0003      | C3           | E1             | X2        | 2026-02-20 | REJECTED           | PENDING
--  A4             | APP-2026-0004      | C1           | E2             | X1        | 2026-06-10 | ACCEPTED           | PAID
--  A5             | APP-2026-0005      | C4           | E2             | X1        | 2026-06-11 | ACCEPTED           | PAID
--  A6             | APP-2026-0006      | C5           | E2             | X2        | 2026-06-15 | ACCEPTED           | PAID
--  A7             | APP-2026-0007      | C2           | E2             | X2        | 2026-06-20 | ACCEPTED           | PAID
--  A8             | APP-2026-0008      | C1           | E3             | X1        | 2026-10-05 | SUBMITTED          | PAID
--  A9             | APP-2026-0009      | C4           | E3             | X1        | 2026-10-07 | SUBMITTED          | PENDING
--  A10            | APP-2026-0010      | C6           | E3             | X4        | 2026-10-09 | ACCEPTED           | PAID
--  A11            | APP-2026-0011      | C3           | E3             | X2        | 2026-10-12 | REJECTED           | FAILED
-- (11 rows)

CREATE TABLE ADMIT_CARDS(
    ADMIT_CARD_ID   VARCHAR(10),
    APPLICATION_ID  VARCHAR(10) NOT NULL,
    ROLL_NUMBER     VARCHAR(20) NOT NULL,
    ISSUE_DATE      DATE        NOT NULL,
    REPORTING_TIME  TIME        NOT NULL,
    PRIMARY KEY(ADMIT_CARD_ID),
    UNIQUE(APPLICATION_ID),
    UNIQUE(ROLL_NUMBER),
    FOREIGN KEY(APPLICATION_ID) REFERENCES APPLICATIONS(APPLICATION_ID) ON DELETE CASCADE);

INSERT INTO ADMIT_CARDS VALUES
    ('AC1','A1','ROLL-UPSC-0001','2026-05-01','08:00'),
    ('AC2','A2','ROLL-UPSC-0002','2026-05-01','08:00'),
    ('AC3','A4','ROLL-KPSC-0001','2026-09-01','09:00'),
    ('AC4','A5','ROLL-KPSC-0002','2026-09-01','09:00'),
    ('AC5','A6','ROLL-KPSC-0003','2026-09-01','09:00'),
    ('AC6','A7','ROLL-KPSC-0004','2026-09-01','09:00');

SELECT * FROM ADMIT_CARDS;

-- OUTPUT:
--  admit_card_id | application_id | roll_number    | issue_date | reporting_time
-- ---------------+----------------+----------------+------------+----------------
--  AC1           | A1             | ROLL-UPSC-0001 | 2026-05-01 | 08:00:00
--  AC2           | A2             | ROLL-UPSC-0002 | 2026-05-01 | 08:00:00
--  AC3           | A4             | ROLL-KPSC-0001 | 2026-09-01 | 09:00:00
--  AC4           | A5             | ROLL-KPSC-0002 | 2026-09-01 | 09:00:00
--  AC5           | A6             | ROLL-KPSC-0003 | 2026-09-01 | 09:00:00
--  AC6           | A7             | ROLL-KPSC-0004 | 2026-09-01 | 09:00:00
-- (6 rows)

CREATE TABLE RESULTS(
    RESULT_ID       VARCHAR(10),
    APPLICATION_ID  VARCHAR(10) NOT NULL,
    MARKS_OBTAINED  NUMERIC(6,2) NOT NULL,
    MAXIMUM_MARKS   NUMERIC(6,2) NOT NULL,
    PERCENTAGE      NUMERIC(5,2),
    RANK            INT,
    RESULT_STATUS   VARCHAR(10) NOT NULL,
    PUBLISHED_AT    DATE,
    PRIMARY KEY(RESULT_ID),
    UNIQUE(APPLICATION_ID),
    FOREIGN KEY(APPLICATION_ID) REFERENCES APPLICATIONS(APPLICATION_ID) ON DELETE CASCADE);

INSERT INTO RESULTS VALUES
    ('R1','A1',105.00,200,NULL,2,'PASS','2026-06-20'),
    ('R2','A2',142.00,200,NULL,1,'PASS','2026-06-20'),
    ('R3','A4',98.00,150,NULL,3,'PASS','2026-10-05'),
    ('R4','A5',112.50,150,NULL,2,'PASS','2026-10-05'),
    ('R5','A6',55.50,150,NULL,4,'FAIL',NULL),
    ('R6','A7',121.00,150,NULL,1,'PASS','2026-10-05');

SELECT * FROM RESULTS;

-- OUTPUT:
--  result_id | application_id | marks_obtained | maximum_marks | percentage | rank | result_status | published_at
-- -----------+----------------+----------------+---------------+------------+------+---------------+--------------
--  R1        | A1             | 105.00         | 200.00        |            | 2    | PASS          | 2026-06-20
--  R2        | A2             | 142.00         | 200.00        |            | 1    | PASS          | 2026-06-20
--  R3        | A4             | 98.00          | 150.00        |            | 3    | PASS          | 2026-10-05
--  R4        | A5             | 112.50         | 150.00        |            | 2    | PASS          | 2026-10-05
--  R5        | A6             | 55.50          | 150.00        |            | 4    | FAIL          |
--  R6        | A7             | 121.00         | 150.00        |            | 1    | PASS          | 2026-10-05
-- (6 rows)

-- ----------------------------------------------------------------------------
-- 1. Find all the candidates who have applied for at least one examination at the
--    "Mangaluru" exam center.
-- ----------------------------------------------------------------------------
select distinct c.candidate_id, c.full_name
from candidates c, applications a, exam_centers x
where x.city = 'MANGALURU'
  and x.center_id = a.center_id
  and a.candidate_id = c.candidate_id
order by c.candidate_id;

-- OUTPUT:
--  candidate_id | full_name
-- --------------+--------------
--  C1           | RAHUL SHARMA
--  C4           | ANITA DSOUZA
-- (2 rows)

-- ----------------------------------------------------------------------------
-- 2. Find the name of the candidate who has scored the highest marks among all the
--    candidates.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, e.examination_code, r.marks_obtained
from candidates c, applications a, examinations e, results r
where c.candidate_id = a.candidate_id
  and a.examination_id = e.examination_id
  and a.application_id = r.application_id
  and r.marks_obtained = (select max(marks_obtained) from results);

-- OUTPUT:
--  candidate_id | full_name   | examination_code | marks_obtained
-- --------------+-------------+------------------+----------------
--  C2           | PRIYA PATEL | UPSC-CSP-2026    | 142.00
-- (1 row)

-- ----------------------------------------------------------------------------
-- 3. Retrieve the candidate name and examination fee of the candidates who have paid
--    the application fee more than Rs. 200.
-- ----------------------------------------------------------------------------
select c.full_name, e.examination_name, e.application_fee
from candidates c, applications a, examinations e
where c.candidate_id = a.candidate_id
  and a.examination_id = e.examination_id
  and a.payment_status = 'PAID'
  and e.application_fee > 200
order by c.full_name;

-- OUTPUT:
--  full_name    | examination_name         | application_fee
-- --------------+--------------------------+-----------------
--  ANITA DSOUZA | FIRST DIVISION ASSISTANT | 300.00
--  PRIYA PATEL  | FIRST DIVISION ASSISTANT | 300.00
--  RAHUL SHARMA | FIRST DIVISION ASSISTANT | 300.00
--  SUMANTH RAO  | FIRST DIVISION ASSISTANT | 300.00
-- (4 rows)

-- ----------------------------------------------------------------------------
-- 4. Retrieve the details of the exam center with maximum and minimum capacity among
--    the various exam centers.
-- ----------------------------------------------------------------------------
select center_code, center_name, city, total_capacity from exam_centers
where total_capacity = (select max(total_capacity) from exam_centers)
union
select center_code, center_name, city, total_capacity from exam_centers
where total_capacity = (select min(total_capacity) from exam_centers)
order by total_capacity desc;

-- OUTPUT:
--  center_code | center_name       | city  | total_capacity
-- -------------+-------------------+-------+----------------
--  DEL-01      | DU EXAM HALL      | DELHI | 1000
--  UDP-01      | MANIPAL EXAM HALL | UDUPI | 300
-- (2 rows)

-- ----------------------------------------------------------------------------
-- 5. Demonstrate how you delete all application tuples at every exam center located in
--    a specific city.
--    (ADMIT_CARDS and RESULTS rows of these applications are removed automatically by
--    ON DELETE CASCADE. We use BEGIN ... ROLLBACK so the data is restored for the next queries.)
-- ----------------------------------------------------------------------------
BEGIN;
SET search_path TO grems_lab;

select (select count(*) from applications) as applications,
       (select count(*) from admit_cards)  as admit_cards,
       (select count(*) from results)      as results;

-- OUTPUT:
--  applications | admit_cards | results
-- --------------+-------------+---------
--  11           | 6           | 6
-- (1 row)

delete from applications
where center_id in (select center_id from exam_centers where city = 'MANGALURU');

-- OUTPUT: DELETE 5

select (select count(*) from applications) as applications,
       (select count(*) from admit_cards)  as admit_cards,
       (select count(*) from results)      as results;

-- OUTPUT:
--  applications | admit_cards | results
-- --------------+-------------+---------
--  6            | 3           | 3
-- (1 row)

ROLLBACK;
SET search_path TO grems_lab;

-- ============================================================================
-- EXPERIMENT 2 :  EXAMINATION DETAILS, DELETE WITH CASCADE, PARTITION AND VIEW
-- ============================================================================

-- 2. Consider the GREMS schema given in Experiment 1 (tables already created above).
--
--    Write SQL queries to
--    1. Retrieve details of all examinations - id, code, name, conducting authority,
--       number of centers, seats allocated, number of applications, etc.
--    2. Get the particulars of candidates who have applied for 2 or more examinations,
--       but only from Jan 2026 to Jun 2026.
--    3. Delete an examination in EXAMINATIONS table. Update the contents of other
--       tables to reflect this data manipulation operation.
--    4. Partition the EXAMINATIONS data based on the date of examination. Demonstrate its
--       working with a simple query.
--    5. Create a view of all examinations and the number of seats that are currently
--       available for applicants.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


-- ----------------------------------------------------------------------------
-- 1. Retrieve details of all examinations - id, code, name, conducting authority,
--    number of centers, seats allocated, number of applications, etc.
-- ----------------------------------------------------------------------------
select e.examination_id, e.examination_code, e.examination_name, e.conducting_authority,
       (select count(*) from examination_centers ec
        where ec.examination_id = e.examination_id) as no_of_centers,
       (select sum(ec.allocated_capacity) from examination_centers ec
        where ec.examination_id = e.examination_id) as seats_allocated,
       (select count(*) from applications a
        where a.examination_id = e.examination_id) as no_of_applications
from examinations e
order by e.examination_id;

-- OUTPUT:
--  examination_id | examination_code | examination_name         | conducting_authority | no_of_centers | seats_allocated | no_of_applications
-- ----------------+------------------+--------------------------+----------------------+---------------+-----------------+--------------------
--  E1             | UPSC-CSP-2026    | CIVIL SERVICES PRELIMS   | UPSC                 | 3             | 1200            | 3
--  E2             | KPSC-FDA-2026    | FIRST DIVISION ASSISTANT | KPSC                 | 2             | 550             | 4
--  E3             | SSC-CGL-2026     | COMBINED GRADUATE LEVEL  | SSC                  | 3             | 750             | 4
--  E4             | IBPS-PO-2027     | PROBATIONARY OFFICER     | IBPS                 | 2             | 550             | 0
-- (4 rows)

-- ----------------------------------------------------------------------------
-- 2. Get the particulars of candidates who have applied for 2 or more examinations,
--    but only from Jan 2026 to Jun 2026.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, c.phone_number, c.city, count(*) as no_of_applications
from candidates c, applications a
where c.candidate_id = a.candidate_id
  and a.applied_at between '2026-01-01' and '2026-06-30'
group by c.candidate_id, c.full_name, c.phone_number, c.city
having count(*) >= 2
order by c.candidate_id;

-- OUTPUT:
--  candidate_id | full_name    | phone_number | city      | no_of_applications
-- --------------+--------------+--------------+-----------+--------------------
--  C1           | RAHUL SHARMA | 9845012345   | MANGALURU | 2
--  C2           | PRIYA PATEL  | 9825098765   | AHMEDABAD | 2
-- (2 rows)

-- ----------------------------------------------------------------------------
-- 3. Delete an examination in EXAMINATIONS table. Update the contents of other
--    tables to reflect this data manipulation operation.
--    (Rows of EXAMINATION_CENTERS referring to the examination are deleted automatically
--    because of ON DELETE CASCADE. BEGIN ... ROLLBACK keeps the sample data intact.)
-- ----------------------------------------------------------------------------
BEGIN;
SET search_path TO grems_lab;

select * from examination_centers where examination_id = 'E4';

-- OUTPUT:
--  examination_id | center_id | allocated_capacity
-- ----------------+-----------+--------------------
--  E4             | X3        | 400
--  E4             | X5        | 150
-- (2 rows)

delete from examinations where examination_id = 'E4';

-- OUTPUT: DELETE 1

select * from examination_centers where examination_id = 'E4';

-- OUTPUT:
--  examination_id | center_id | allocated_capacity
-- ----------------+-----------+--------------------
-- (0 rows)

ROLLBACK;
SET search_path TO grems_lab;

-- ----------------------------------------------------------------------------
-- 4. Partition the EXAMINATIONS data based on the date of examination. Demonstrate its
--    working with a simple query.
--    (PostgreSQL uses declarative partitioning: every partition is itself a table, so we
--    read a partition by its name.)
-- ----------------------------------------------------------------------------
CREATE TABLE EXAMINATION_ARCHIVE(
    EXAMINATION_ID        VARCHAR(10),
    EXAMINATION_CODE      VARCHAR(20),
    EXAMINATION_NAME      VARCHAR(40),
    CONDUCTING_AUTHORITY  VARCHAR(20),
    EXAMINATION_DATE      DATE NOT NULL,
    TOTAL_VACANCIES       INT,
    PRIMARY KEY(EXAMINATION_ID, EXAMINATION_DATE))
PARTITION BY RANGE(EXAMINATION_DATE);

CREATE TABLE EXAM_P2026_H1 PARTITION OF EXAMINATION_ARCHIVE FOR VALUES FROM ('2026-01-01') TO ('2026-07-01');

CREATE TABLE EXAM_P2026_H2 PARTITION OF EXAMINATION_ARCHIVE FOR VALUES FROM ('2026-07-01') TO ('2027-01-01');

CREATE TABLE EXAM_P2027    PARTITION OF EXAMINATION_ARCHIVE FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

INSERT INTO EXAMINATION_ARCHIVE
select examination_id, examination_code, examination_name, conducting_authority,
       examination_date, total_vacancies
from examinations;

SELECT * FROM EXAM_P2026_H1;

-- OUTPUT:
--  examination_id | examination_code | examination_name       | conducting_authority | examination_date | total_vacancies
-- ----------------+------------------+------------------------+----------------------+------------------+-----------------
--  E1             | UPSC-CSP-2026    | CIVIL SERVICES PRELIMS | UPSC                 | 2026-05-24       | 979
-- (1 row)

select tableoid::regclass as partition_name, examination_code, examination_date
from examination_archive
order by examination_date;

-- OUTPUT:
--  partition_name | examination_code | examination_date
-- ----------------+------------------+------------------
--  exam_p2026_h1  | UPSC-CSP-2026    | 2026-05-24
--  exam_p2026_h2  | KPSC-FDA-2026    | 2026-09-20
--  exam_p2027     | SSC-CGL-2026     | 2027-01-18
--  exam_p2027     | IBPS-PO-2027     | 2027-04-12
-- (4 rows)

-- Partition pruning: only the partition EXAM_P2026_H2 is scanned for this date range.
explain (costs off)
select * from examination_archive
where examination_date between '2026-07-01' and '2026-12-31';

-- OUTPUT:
--  QUERY PLAN
-- ---------------------------------------------------------------------------------------------------
--  Seq Scan on exam_p2026_h2 examination_archive
--    Filter: ((examination_date >= '2026-07-01'::date) AND (examination_date <= '2026-12-31'::date))
-- (2 rows)

-- ----------------------------------------------------------------------------
-- 5. Create a view of all examinations and the number of seats that are currently
--    available for applicants.
-- ----------------------------------------------------------------------------
Create view available_seats
As select e.examination_id, e.examination_name,
   (select sum(ec.allocated_capacity) from examination_centers ec
    where ec.examination_id = e.examination_id)
 - (select count(*) from applications a
    where a.examination_id = e.examination_id
      and a.application_status <> 'REJECTED') as seats_available
from examinations e;

SELECT * FROM AVAILABLE_SEATS ORDER BY EXAMINATION_ID;

-- OUTPUT:
--  examination_id | examination_name         | seats_available
-- ----------------+--------------------------+-----------------
--  E1             | CIVIL SERVICES PRELIMS   | 1198
--  E2             | FIRST DIVISION ASSISTANT | 546
--  E3             | COMBINED GRADUATE LEVEL  | 747
--  E4             | PROBATIONARY OFFICER     | 550
-- (4 rows)

-- ============================================================================
-- EXPERIMENT 3 :  CANDIDATE DETAILS, VIEW, UPDATE AND CATEGORISATION OF RESULTS
-- ============================================================================

-- 3. Consider the GREMS schema given in Experiment 1 (tables already created above).
--
--    Write SQL queries to
--    1. List all the candidate details who have an ACCEPTED application for the
--       examination "KPSC-FDA-2026", along with their bachelor's degree percentage.
--    2. Compute the total number of male and female candidates in each examination.
--    3. Create a view of the marks of candidate "C1" in all the examinations.
--    4. Calculate the Percentage (Marks_obtained * 100 / Maximum_marks) and update the
--       corresponding table for all candidates.
--    5. Categorize candidates based on the following criterion:
--         If Percentage >= 75 then CATEGORY = "OUTSTANDING"
--         If Percentage >= 60 then CATEGORY = "GOOD"
--         If Percentage >= 40 then CATEGORY = "AVERAGE"
--         If Percentage <  40 then CATEGORY = "WEAK"
--       Give these details only for the examinations conducted by UPSC and KPSC.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


-- ----------------------------------------------------------------------------
-- 1. List all the candidate details who have an ACCEPTED application for the
--    examination "KPSC-FDA-2026", along with their bachelor's degree percentage.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, c.gender, c.city, q.percentage
from candidates c, applications a, examinations e, educational_qualifications q
where e.examination_code = 'KPSC-FDA-2026'
  and a.examination_id = e.examination_id
  and a.candidate_id = c.candidate_id
  and a.application_status = 'ACCEPTED'
  and q.candidate_id = c.candidate_id
  and q.qualification_level = 'BACHELORS'
order by c.candidate_id;

-- OUTPUT:
--  candidate_id | full_name    | gender | city      | percentage
-- --------------+--------------+--------+-----------+------------
--  C1           | RAHUL SHARMA | MALE   | MANGALURU | 78.50
--  C2           | PRIYA PATEL  | FEMALE | AHMEDABAD | 72.40
--  C4           | ANITA DSOUZA | FEMALE | UDUPI     | 81.00
--  C5           | SUMANTH RAO  | MALE   | BENGALURU | 66.75
-- (4 rows)

-- ----------------------------------------------------------------------------
-- 2. Compute the total number of male and female candidates in each examination.
-- ----------------------------------------------------------------------------
select e.examination_code, c.gender, count(*) as total
from candidates c, applications a, examinations e
where c.candidate_id = a.candidate_id
  and a.examination_id = e.examination_id
group by e.examination_code, c.gender
order by e.examination_code, c.gender;

-- OUTPUT:
--  examination_code | gender | total
-- ------------------+--------+-------
--  KPSC-FDA-2026    | FEMALE | 2
--  KPSC-FDA-2026    | MALE   | 2
--  SSC-CGL-2026     | FEMALE | 2
--  SSC-CGL-2026     | MALE   | 2
--  UPSC-CSP-2026    | FEMALE | 1
--  UPSC-CSP-2026    | MALE   | 2
-- (6 rows)

-- ----------------------------------------------------------------------------
-- 3. Create a view of the marks of candidate "C1" in all the examinations.
-- ----------------------------------------------------------------------------
Create view c1_results As
select e.examination_code, r.marks_obtained, r.maximum_marks
from applications a, examinations e, results r
where a.candidate_id = 'C1'
  and a.examination_id = e.examination_id
  and r.application_id = a.application_id;

SELECT * FROM C1_RESULTS;

-- OUTPUT:
--  examination_code | marks_obtained | maximum_marks
-- ------------------+----------------+---------------
--  UPSC-CSP-2026    | 105.00         | 200.00
--  KPSC-FDA-2026    | 98.00          | 150.00
-- (2 rows)

-- ----------------------------------------------------------------------------
-- 4. Calculate the Percentage (Marks_obtained * 100 / Maximum_marks) and update the
--    corresponding table for all candidates.
-- ----------------------------------------------------------------------------
update results set percentage = round(marks_obtained * 100 / maximum_marks, 2);

-- OUTPUT: UPDATE 6

select result_id, application_id, marks_obtained, maximum_marks, percentage from results order by result_id;

-- OUTPUT:
--  result_id | application_id | marks_obtained | maximum_marks | percentage
-- -----------+----------------+----------------+---------------+------------
--  R1        | A1             | 105.00         | 200.00        | 52.50
--  R2        | A2             | 142.00         | 200.00        | 71.00
--  R3        | A4             | 98.00          | 150.00        | 65.33
--  R4        | A5             | 112.50         | 150.00        | 75.00
--  R5        | A6             | 55.50          | 150.00        | 37.00
--  R6        | A7             | 121.00         | 150.00        | 80.67
-- (6 rows)

-- ----------------------------------------------------------------------------
-- 5. Categorize candidates based on the percentage. Give these details only for the
--    examinations conducted by UPSC and KPSC.
-- ----------------------------------------------------------------------------
select c.full_name, e.examination_code, r.percentage,
       case when r.percentage >= 75 then 'OUTSTANDING'
            when r.percentage >= 60 then 'GOOD'
            when r.percentage >= 40 then 'AVERAGE'
            else 'WEAK' end as category
from candidates c, applications a, examinations e, results r
where c.candidate_id = a.candidate_id
  and a.examination_id = e.examination_id
  and a.application_id = r.application_id
  and e.conducting_authority in ('UPSC','KPSC')
order by r.percentage desc;

-- OUTPUT:
--  full_name    | examination_code | percentage | category
-- --------------+------------------+------------+-------------
--  PRIYA PATEL  | KPSC-FDA-2026    | 80.67      | OUTSTANDING
--  ANITA DSOUZA | KPSC-FDA-2026    | 75.00      | OUTSTANDING
--  PRIYA PATEL  | UPSC-CSP-2026    | 71.00      | GOOD
--  RAHUL SHARMA | KPSC-FDA-2026    | 65.33      | GOOD
--  RAHUL SHARMA | UPSC-CSP-2026    | 52.50      | AVERAGE
--  SUMANTH RAO  | KPSC-FDA-2026    | 37.00      | WEAK
-- (6 rows)

-- ============================================================================
-- EXPERIMENT 4 :  NESTED QUERIES, NOT EXISTS, NOT IN AND GROUP BY ... HAVING
-- ============================================================================

-- 4. Consider the GREMS schema given in Experiment 1 (tables already created above).
--
--    Write SQL queries to
--    1. Find the candidate name and marks of the candidate who has the second highest marks.
--    2. For each candidate who has applied for more than two examinations, find the
--       candidate_id and the best marks obtained by him or her.
--    3. Find the names of the examinations such that all the candidates who appeared for
--       them have scored more than 50 percent.
--    4. Find the candidates whose application is ACCEPTED but whose admit card has not
--       been issued yet.
--    5. Find the exam centers where the total number of seats allocated (over all the
--       examinations) is more than 800.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


-- ----------------------------------------------------------------------------
-- 1. Find the candidate name and marks of the candidate who has the second highest marks.
-- ----------------------------------------------------------------------------
select c.full_name, r.marks_obtained
from candidates c, applications a, results r
where c.candidate_id = a.candidate_id
  and a.application_id = r.application_id
  and r.marks_obtained = (select max(marks_obtained) from results
                          where marks_obtained < (select max(marks_obtained) from results));

-- OUTPUT:
--  full_name   | marks_obtained
-- -------------+----------------
--  PRIYA PATEL | 121.00
-- (1 row)

-- ----------------------------------------------------------------------------
-- 2. For each candidate who has applied for more than two examinations, find the
--    candidate_id and the best marks obtained by him or her.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, count(*) as no_of_applications,
       (select max(r.marks_obtained) from results r, applications a2
        where a2.application_id = r.application_id
          and a2.candidate_id = c.candidate_id) as best_marks
from candidates c, applications a
where c.candidate_id = a.candidate_id
group by c.candidate_id, c.full_name
having count(*) > 2;

-- OUTPUT:
--  candidate_id | full_name    | no_of_applications | best_marks
-- --------------+--------------+--------------------+------------
--  C1           | RAHUL SHARMA | 3                  | 105.00
-- (1 row)

-- ----------------------------------------------------------------------------
-- 3. Find the names of the examinations such that all the candidates who appeared for
--    them have scored more than 50 percent.
-- ----------------------------------------------------------------------------
select e.examination_code, e.examination_name
from examinations e
where exists (select * from applications a, results r
              where a.examination_id = e.examination_id
                and a.application_id = r.application_id)
  and not exists (select * from applications a, results r
                  where a.examination_id = e.examination_id
                    and a.application_id = r.application_id
                    and r.percentage <= 50);

-- OUTPUT:
--  examination_code | examination_name
-- ------------------+------------------------
--  UPSC-CSP-2026    | CIVIL SERVICES PRELIMS
-- (1 row)

-- ----------------------------------------------------------------------------
-- 4. Find the candidates whose application is ACCEPTED but whose admit card has not
--    been issued yet.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, a.application_number, a.examination_id
from candidates c, applications a
where c.candidate_id = a.candidate_id
  and a.application_status = 'ACCEPTED'
  and a.application_id not in (select application_id from admit_cards);

-- OUTPUT:
--  candidate_id | full_name   | application_number | examination_id
-- --------------+-------------+--------------------+----------------
--  C6           | FATIMA KHAN | APP-2026-0010      | E3
-- (1 row)

-- ----------------------------------------------------------------------------
-- 5. Find the exam centers where the total number of seats allocated (over all the
--    examinations) is more than 800.
-- ----------------------------------------------------------------------------
select x.center_code, x.center_name, x.city, sum(ec.allocated_capacity) as total_allocated
from exam_centers x, examination_centers ec
where x.center_id = ec.center_id
group by x.center_code, x.center_name, x.city
having sum(ec.allocated_capacity) > 800
order by total_allocated desc;

-- OUTPUT:
--  center_code | center_name      | city      | total_allocated
-- -------------+------------------+-----------+-----------------
--  BLR-01      | CHRIST EXAM HALL | BENGALURU | 1000
--  DEL-01      | DU EXAM HALL     | DELHI     | 900
-- (2 rows)

-- ============================================================================
-- EXPERIMENT 5 :  TRIGGERS AND FUNCTIONS
-- ============================================================================

-- 5. Consider the GREMS schema given in Experiment 1 (tables already created above).
--
--    Write SQL programs to
--    1. Create a trigger that stops the allocation of more seats to an exam center than
--       its total capacity on the same examination date.
--    2. Create a trigger that automatically calculates the Percentage and the
--       Result_status (PASS if Percentage >= 40, otherwise FAIL) when a result is entered.
--    3. Create a function that returns the number of seats still left at an exam center
--       for an examination.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


-- ----------------------------------------------------------------------------
-- 1. Create a trigger that stops the allocation of more seats to an exam center than
--    its total capacity on the same examination date.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_center_capacity() RETURNS TRIGGER AS $$
DECLARE
    v_total  INT;
    v_date   DATE;
    v_other  INT;
BEGIN
    select total_capacity into v_total from exam_centers where center_id = new.center_id;
    select examination_date into v_date from examinations where examination_id = new.examination_id;

    -- seats already given to other examinations held at this center on the same date
    select coalesce(sum(ec.allocated_capacity), 0) into v_other
    from examination_centers ec, examinations e
    where ec.examination_id = e.examination_id
      and ec.center_id = new.center_id
      and e.examination_date = v_date
      and ec.examination_id <> new.examination_id;

    if new.allocated_capacity > v_total or v_other + new.allocated_capacity > v_total then
        raise exception 'Allocation of % seats exceeds the capacity % of center %',
                        new.allocated_capacity, v_total, new.center_id;
    end if;
    return new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_capacity
BEFORE INSERT OR UPDATE ON examination_centers
FOR EACH ROW EXECUTE FUNCTION validate_center_capacity();

-- Test 1: center X4 holds only 600 candidates, so 700 seats must be rejected.
BEGIN;
SET search_path TO grems_lab;

insert into examination_centers values ('E4','X4',700);

-- OUTPUT: ERROR:  Allocation of 700 seats exceeds the capacity 600 of center X4

ROLLBACK;
SET search_path TO grems_lab;

-- Test 2: 500 seats are within the capacity, so the row is accepted.
BEGIN;
SET search_path TO grems_lab;

insert into examination_centers values ('E4','X4',500);

-- OUTPUT: INSERT 0 1

select * from examination_centers where examination_id = 'E4' order by center_id;

-- OUTPUT:
--  examination_id | center_id | allocated_capacity
-- ----------------+-----------+--------------------
--  E4             | X3        | 400
--  E4             | X4        | 500
--  E4             | X5        | 150
-- (3 rows)

ROLLBACK;
SET search_path TO grems_lab;

-- ----------------------------------------------------------------------------
-- 2. Create a trigger that automatically calculates the Percentage and the
--    Result_status (PASS if Percentage >= 40, otherwise FAIL) when a result is entered.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_result() RETURNS TRIGGER AS $$
BEGIN
    new.percentage := round(new.marks_obtained * 100 / new.maximum_marks, 2);
    if new.percentage >= 40 then
        new.result_status := 'PASS';
    else
        new.result_status := 'FAIL';
    end if;
    return new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_result
BEFORE INSERT OR UPDATE OF marks_obtained, maximum_marks ON results
FOR EACH ROW EXECUTE FUNCTION calculate_result();

-- Only marks are entered. Percentage and Result_status are filled in by the trigger.
BEGIN;
SET search_path TO grems_lab;

insert into results (result_id, application_id, marks_obtained, maximum_marks) values ('R7','A10',90,150);

-- OUTPUT: INSERT 0 1

select result_id, application_id, marks_obtained, maximum_marks, percentage, result_status from results where result_id = 'R7';

-- OUTPUT:
--  result_id | application_id | marks_obtained | maximum_marks | percentage | result_status
-- -----------+----------------+----------------+---------------+------------+---------------
--  R7        | A10            | 90.00          | 150.00        | 60.00      | PASS
-- (1 row)

ROLLBACK;
SET search_path TO grems_lab;

-- ----------------------------------------------------------------------------
-- 3. Create a function that returns the number of seats still left at an exam center
--    for an examination.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION seats_left(p_exam VARCHAR, p_center VARCHAR) RETURNS INT AS $$
    select ec.allocated_capacity
           - (select count(*) from applications a
              where a.examination_id = ec.examination_id
                and a.center_id = ec.center_id
                and a.application_status <> 'REJECTED')
    from examination_centers ec
    where ec.examination_id = p_exam and ec.center_id = p_center;
$$ LANGUAGE sql;

select seats_left('E3','X1') as seats_left;

-- OUTPUT:
--  seats_left
-- ------------
--  198
-- (1 row)

select ec.examination_id, ec.center_id, ec.allocated_capacity,
       seats_left(ec.examination_id, ec.center_id) as seats_left
from examination_centers ec
order by ec.examination_id, ec.center_id;

-- OUTPUT:
--  examination_id | center_id | allocated_capacity | seats_left
-- ----------------+-----------+--------------------+------------
--  E1             | X1        | 300                | 299
--  E1             | X2        | 400                | 400
--  E1             | X3        | 500                | 499
--  E2             | X1        | 250                | 248
--  E2             | X2        | 300                | 298
--  E3             | X1        | 200                | 198
--  E3             | X2        | 300                | 300
--  E3             | X4        | 250                | 249
--  E4             | X3        | 400                | 400
--  E4             | X5        | 150                | 150
-- (10 rows)

-- ============================================================================
-- EXPERIMENT 6 :  ADDITIONAL QUERIES (PATTERN MATCHING, SET DIFFERENCE, DIVISION AND DDL)
-- ============================================================================

-- 6. Consider the GREMS schema given in Experiment 1 (tables already created above).
--
--    Write SQL queries to
--    1. Find all examinations whose examination name contains the word "GRADUATE"
--       (pattern matching using LIKE).
--    2. Find the candidate details and marks of candidates who have scored strictly
--       above the overall average marks across all examinations.
--    3. Find the cities where exam centers are located but no registered candidate
--       currently resides (set difference using EXCEPT).
--    4. Find the candidates who have not applied for the examination "UPSC-CSP-2026"
--       (anti-join using NOT EXISTS).
--    5. Find the candidates who have applied for all examinations conducted by the
--       conducting authority "UPSC" (relational division using NOT EXISTS).
--    6. Demonstrate altering a table to add a new column to the CANDIDATES table and
--       adding a CHECK constraint on the EXAMINATIONS table.

-- ----------------------------------------------------------------------------
-- SOLUTIONS:
-- ----------------------------------------------------------------------------
SET search_path TO grems_lab;


-- ----------------------------------------------------------------------------
-- 1. Find all examinations whose examination name contains the word "GRADUATE"
--    (pattern matching using LIKE).
-- ----------------------------------------------------------------------------
select examination_code, examination_name, conducting_authority, total_vacancies
from examinations
where examination_name like '%GRADUATE%'
order by examination_code;

-- OUTPUT:
--  examination_code | examination_name        | conducting_authority | total_vacancies
-- ------------------+-------------------------+----------------------+-----------------
--  SSC-CGL-2026     | COMBINED GRADUATE LEVEL | SSC                  | 1500
-- (1 row)

-- ----------------------------------------------------------------------------
-- 2. Find the candidate details and marks of candidates who have scored strictly
--    above the overall average marks across all examinations.
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, e.examination_code, r.marks_obtained
from candidates c, applications a, examinations e, results r
where c.candidate_id = a.candidate_id
  and a.examination_id = e.examination_id
  and a.application_id = r.application_id
  and r.marks_obtained > (select avg(marks_obtained) from results)
order by r.marks_obtained desc;

-- OUTPUT:
--  candidate_id | full_name    | examination_code | marks_obtained
-- --------------+--------------+------------------+----------------
--  C2           | PRIYA PATEL  | UPSC-CSP-2026    | 142.00
--  C2           | PRIYA PATEL  | KPSC-FDA-2026    | 121.00
--  C4           | ANITA DSOUZA | KPSC-FDA-2026    | 112.50
-- (3 rows)

-- ----------------------------------------------------------------------------
-- 3. Find the cities where exam centers are located but no registered candidate
--    currently resides (set difference using EXCEPT).
-- ----------------------------------------------------------------------------
select city from exam_centers
except
select city from candidates
order by city;

-- OUTPUT:
--  city
-- -------
--  DELHI
-- (1 row)

-- ----------------------------------------------------------------------------
-- 4. Find the candidates who have not applied for the examination "UPSC-CSP-2026"
--    (anti-join using NOT EXISTS).
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name, c.city
from candidates c
where not exists (select * from applications a, examinations e
                  where a.candidate_id = c.candidate_id
                    and a.examination_id = e.examination_id
                    and e.examination_code = 'UPSC-CSP-2026')
order by c.candidate_id;

-- OUTPUT:
--  candidate_id | full_name    | city
-- --------------+--------------+-----------
--  C4           | ANITA DSOUZA | UDUPI
--  C5           | SUMANTH RAO  | BENGALURU
--  C6           | FATIMA KHAN  | HYDERABAD
-- (3 rows)

-- ----------------------------------------------------------------------------
-- 5. Find the candidates who have applied for all examinations conducted by the
--    conducting authority "UPSC" (relational division using NOT EXISTS).
-- ----------------------------------------------------------------------------
select c.candidate_id, c.full_name
from candidates c
where not exists (select * from examinations e
                  where e.conducting_authority = 'UPSC'
                    and not exists (select * from applications a
                                    where a.candidate_id = c.candidate_id
                                      and a.examination_id = e.examination_id))
order by c.candidate_id;

-- OUTPUT:
--  candidate_id | full_name
-- --------------+--------------
--  C1           | RAHUL SHARMA
--  C2           | PRIYA PATEL
--  C3           | AMIT KUMAR
-- (3 rows)

-- ----------------------------------------------------------------------------
-- 6. Demonstrate altering a table to add a new column to the CANDIDATES table and
--    adding a CHECK constraint on the EXAMINATIONS table.
--    (BEGIN ... ROLLBACK safely verifies the alterations without changing schema state.)
-- ----------------------------------------------------------------------------
BEGIN;
SET search_path TO grems_lab;

ALTER TABLE candidates ADD COLUMN alternate_phone VARCHAR(15);

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'grems_lab'
  and table_name = 'candidates'
  and column_name = 'alternate_phone';

-- OUTPUT:
--  column_name     | data_type         | is_nullable
-- -----------------+-------------------+-------------
--  alternate_phone | character varying | YES
-- (1 row)

ALTER TABLE examinations ADD CONSTRAINT chk_exam_fee CHECK (application_fee <= 5000);

select constraint_name, constraint_type
from information_schema.table_constraints
where table_schema = 'grems_lab'
  and table_name = 'examinations'
  and constraint_name = 'chk_exam_fee';

-- OUTPUT:
--  constraint_name | constraint_type
-- -----------------+-----------------
--  chk_exam_fee    | CHECK
-- (1 row)

ROLLBACK;
SET search_path TO grems_lab;

-- ============================================================================
-- SCHEMA DIAGRAM
-- (PK = primary key, FK = foreign key, UK = unique)
-- ============================================================================

-- CANDIDATES
-- | Candidate_id (PK) | Candidate_number (UK) | Full_name | Date_of_birth | Gender | Phone_number | City | State | Category |
--
-- EDUCATIONAL_QUALIFICATIONS
-- | Qualification_id (PK) | Candidate_id (FK) | Qualification_level | Institution_name | Passing_year | Percentage |
--
-- EXAMINATIONS
-- | Examination_id (PK) | Examination_code (UK) | Examination_name | Conducting_authority | Application_start_date |
-- | Application_end_date | Examination_date | Application_fee | Total_vacancies | Examination_status |
--
-- EXAM_CENTERS
-- | Center_id (PK) | Center_code (UK) | Center_name | City | State | Total_capacity |
--
-- EXAMINATION_CENTERS
-- | Examination_id (PK, FK) | Center_id (PK, FK) | Allocated_capacity |
--
-- APPLICATIONS
-- | Application_id (PK) | Application_number (UK) | Candidate_id (FK) | Examination_id (FK) | Center_id (FK) |
-- | Applied_at | Application_status | Payment_status |      (UK: Candidate_id + Examination_id)
-- (Examination_id, Center_id) is a composite FK to EXAMINATION_CENTERS
--
-- ADMIT_CARDS
-- | Admit_card_id (PK) | Application_id (FK, UK) | Roll_number (UK) | Issue_date | Reporting_time |
--
-- RESULTS
-- | Result_id (PK) | Application_id (FK, UK) | Marks_obtained | Maximum_marks | Percentage | Rank | Result_status | Published_at |
--
-- Relationships
--   CANDIDATES 1 ---- N EDUCATIONAL_QUALIFICATIONS
--   CANDIDATES 1 ---- N APPLICATIONS  N ---- 1 EXAMINATIONS
--   EXAMINATIONS N ---- M EXAM_CENTERS   (through EXAMINATION_CENTERS)
--   APPLICATIONS 1 ---- 1 ADMIT_CARDS
--   APPLICATIONS 1 ---- 1 RESULTS
