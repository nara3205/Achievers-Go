/* =========================
   USER
========================= */
CREATE TABLE Users (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  email_niu VARCHAR(150) NOT NULL,
  tipus ENUM('student','teacher') NOT NULL,
  password VARCHAR(250) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (email_niu)
);

/* =========================
   SUBJECT
========================= */
CREATE TABLE Subject (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  descripcio VARCHAR(400) NULL,
  id_teacher INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Users_TO_Subject
    FOREIGN KEY (id_teacher)
    REFERENCES Users(id)
    ON DELETE RESTRICT
);

/* =========================
   ASSIGNMENT
========================= */
CREATE TABLE Assignment (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  data_venciment VARCHAR(25) NOT NULL,
  descripcio VARCHAR(400) NULL,
  id_subject INT NOT NULL,
  tasques_totals INT NOT NULL,
  insignia INT NOT NULL,
  sessions INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Subject_TO_Assignment
    FOREIGN KEY (id_subject)
    REFERENCES Subject(id)
    ON DELETE CASCADE
);

/* =========================
   TASK
========================= */
CREATE TABLE Task (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  data_venciment VARCHAR(25) NULL,
  punts INT NOT NULL DEFAULT 0,
  id_assignment INT NOT NULL,
  descripcio VARCHAR(400) NULL,
  id_sessio INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Assignment_TO_Task
    FOREIGN KEY (id_assignment)
    REFERENCES Assignment(id)
    ON DELETE CASCADE
);

/* =========================
   GROUPS
========================= */
CREATE TABLE Groups (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(300) NOT NULL,
  id_subject INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Subject_TO_Groups
    FOREIGN KEY (id_subject)
    REFERENCES Subject(id)
    ON DELETE CASCADE
);

/* =========================
   SUBGROUPS
========================= */
CREATE TABLE Subgroups (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(300) NOT NULL,
  id_group INT NOT NULL,
  avatar_url VARCHAR(250) NULL,
  punts_totals INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Groups_TO_Subgroups
    FOREIGN KEY (id_group)
    REFERENCES Groups(id)
    ON DELETE CASCADE
);

/* =========================
   STUDENT ↔ GROUP
========================= */
CREATE TABLE Student_group (
  id_student INT NOT NULL,
  id_group INT NOT NULL,
  PRIMARY KEY (id_student, id_group),
  CONSTRAINT FK_Users_TO_student_group
    FOREIGN KEY (id_student)
    REFERENCES Users(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Groups_TO_student_group
    FOREIGN KEY (id_group)
    REFERENCES Groups(id)
    ON DELETE CASCADE
);

/* =========================
   STUDENT ↔ SUBGROUP
========================= */
CREATE TABLE Subgroups_student (
  id_subgroup INT NOT NULL,
  id_student INT NOT NULL,
  PRIMARY KEY (id_subgroup, id_student),
  CONSTRAINT FK_Subgroups_TO_Subgroups_student
    FOREIGN KEY (id_subgroup)
    REFERENCES Subgroups(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Users_TO_Subgroups_student
    FOREIGN KEY (id_student)
    REFERENCES Users(id)
    ON DELETE CASCADE
);

/* =========================
   TASK DELIVERY
========================= */
CREATE TABLE Subgroups_task (
  id_subgroup INT NOT NULL,
  id_task INT NOT NULL,
  estat ENUM('ontime','offtime','empty') NOT NULL,
  comentari VARCHAR(400) NULL,
  PRIMARY KEY (id_subgroup, id_task),
  CONSTRAINT FK_Subgroups_TO_task
    FOREIGN KEY (id_subgroup)
    REFERENCES Subgroups(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Task_TO_Subgroups_task
    FOREIGN KEY (id_task)
    REFERENCES Task(id)
    ON DELETE CASCADE
);
