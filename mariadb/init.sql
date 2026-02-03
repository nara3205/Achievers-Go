/* =========================
   USER
========================= */
CREATE TABLE User (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  email_niu VARCHAR(150) NOT NULL,
  tipus ENUM('alumne','professor') NOT NULL,
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
  CONSTRAINT FK_User_TO_Subject
    FOREIGN KEY (id_teacher)
    REFERENCES User(id)
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
   GRUP
========================= */
CREATE TABLE Grup (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(300) NOT NULL,
  id_subject INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Subject_TO_Grup
    FOREIGN KEY (id_subject)
    REFERENCES Subject(id)
    ON DELETE CASCADE
);

/* =========================
   SUBGRUP
========================= */
CREATE TABLE Subgrup (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(300) NOT NULL,
  id_group INT NOT NULL,
  avatar_url VARCHAR(250) NULL,
  punts_totals INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_Grup_TO_Subgrup
    FOREIGN KEY (id_group)
    REFERENCES Grup(id)
    ON DELETE CASCADE
);

/* =========================
   STUDENT ↔ GRUP
========================= */
CREATE TABLE student_grup (
  id_student INT NOT NULL,
  id_grup INT NOT NULL,
  PRIMARY KEY (id_student, id_grup),
  CONSTRAINT FK_User_TO_student_grup
    FOREIGN KEY (id_student)
    REFERENCES User(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Grup_TO_student_grup
    FOREIGN KEY (id_grup)
    REFERENCES Grup(id)
    ON DELETE CASCADE
);

/* =========================
   STUDENT ↔ SUBGRUP
========================= */
CREATE TABLE subgrup_student (
  id_subgroup INT NOT NULL,
  id_student INT NOT NULL,
  PRIMARY KEY (id_subgroup, id_student),
  CONSTRAINT FK_Subgrup_TO_subgrup_student
    FOREIGN KEY (id_subgroup)
    REFERENCES Subgrup(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_User_TO_subgrup_student
    FOREIGN KEY (id_student)
    REFERENCES User(id)
    ON DELETE CASCADE
);

/* =========================
   ENTREGA TASCA
========================= */
CREATE TABLE subgrup_entrega_tasca (
  id_subgroup INT NOT NULL,
  id_task INT NOT NULL,
  estat ENUM('ontime','offtime','empty') NOT NULL,
  comentari VARCHAR(400) NULL,
  PRIMARY KEY (id_subgroup, id_task),
  CONSTRAINT FK_Subgrup_TO_entrega
    FOREIGN KEY (id_subgroup)
    REFERENCES Subgrup(id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Task_TO_entrega
    FOREIGN KEY (id_task)
    REFERENCES Task(id)
    ON DELETE CASCADE
);
