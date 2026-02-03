// ### IMPORTS ###
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const multer = require('multer');
const fs = require('fs');
const { parse } = require('csv-parse');
const bcrypt = require('bcrypt');

// ### EXPRESS CONFIGURATIONS ###
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

// ### DB CONFIGURATION ###
const pool = mariadb.createPool({
  host: 'db',
  user: 'root',
  password: 'user',
  database: 'user',
  connectionLimit: 5
});
const upload = multer({ dest: 'uploads/' });

// ### AUX FUNCTIONS TEACHER###

async function populaDB() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("INSERT INTO User (nom, email_niu, tipus, password) VALUES (?, ?, ?, ?)", ["Aran", "aran@example.com", "professor", "12345"]);
    console.log('DB populada!');
  }
  catch (err) {
    console.error('Error poblant la DB:', err);
    throw err;
  }
  finally {
    if (conn) conn.release();
  }
}

async function getOrCreateGrup(groupName, id_subject) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "SELECT id FROM Grup WHERE nom = ? AND id_subject = ?",
      [groupName, id_subject]
    );

    if (result.length > 0) return result[0].id;

    const insert = await conn.query(
      "INSERT INTO Grup (nom, id_subject) VALUES (?, ?)",
      [groupName, id_subject]
    );
    return insert.insertId;

  } finally {
    if (conn) conn.release();
  }
}

async function getOrCreateStudent(student) {
  let conn;
  try {
    conn = await pool.getConnection();

    const rawPassword = `${student['Número ID']}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const result = await conn.query(
      "INSERT INTO User (nom, email_niu, tipus, password) VALUES (?, ?, ?, ?)",
      [
        `${student.Nom} ${student.Cognoms}`,
        student['Número ID'],
        "alumne",
        hashedPassword
      ]
    );

    console.log(`Estudiant creat: ${student.Nom}`);
    return result.insertId;

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const rows = await conn.query(
        "SELECT id FROM User WHERE email_niu = ?",
        [student['Número ID']]
      );
      return rows[0].id;
    }
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function linkStudentGroup(studentId, groupId) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO student_grup (id_student, id_grup) VALUES (?, ?)",
      [studentId, groupId]
    );
  } finally {
    if (conn) conn.release();
  }
}

async function populaSubject(subjectName, subjectDescription, teacherID) {
  let conn;

  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO Subject (nom, descripcio, id_teacher) VALUES (?, ?, ?)",
      [subjectName, subjectDescription, teacherID]
    );
    return result.insertId;
  } catch (err) {
    console.log(err)
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getSubjectsbyTeacher(teacherID) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `SELECT 
         s.id AS id_subject,
         s.nom AS nom_subject,
         s.descripcio AS descripcio_subject
       FROM Subject s
       WHERE s.id_teacher = ?;`,
      [teacherID]
    );

    return result
  } catch (err) {
    console.error('Error a getSubjectsbyTeacher:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteSubject(id_subject) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result =     await conn.query(
      `DELETE FROM Subject WHERE id = ?`,
      [id_subject]
    );
    return result
  } catch (err) {
    console.error('Error a deleteSubject:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function createAssignment(assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO Assignment (nom, descripcio, data_venciment, id_subject, tasques_totals, insignia, sessions ) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions]
    );
    const [createdAssignment] = await conn.query(
      `SELECT * FROM Assignment WHERE id = ?`,
      [result.insertId]
    );
    return createdAssignment;

  } catch (err) {
    console.error(' Error a createAssignment:', err);
    throw err;
  }
  finally {
    if (conn) conn.release();
  }

}

async function updateAssignment(assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions, id_assignment) {
let conn;
console.log(assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions, id_assignment)

  try {
    conn = await pool.getConnection();

    await conn.query(
      `UPDATE Assignment
       SET nom = ?,
           descripcio = ?,
           data_venciment = ?,
           id_subject = ?,
           tasques_totals = ?,
           insignia = ?,
           sessions = ?
       WHERE id = ?`,
      [
        assignmentName,
        assignmentDescription,
        assignmentDate,
        id_subject,
        assignmentTasks,
        assignmentInsignia,
        assignmentSessions,
        id_assignment
      ]
    );

    const [updatedAssignment] = await conn.query(
      `SELECT * FROM Assignment WHERE id = ?`,
      [id_assignment]
    );

    return updatedAssignment;

  } catch (err) {
    console.error("Error a uopdateAssignment:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function updateAssignmentTaskCount(id_assignment) {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      `UPDATE Assignment 
       SET tasques_totals = (SELECT COUNT(*) FROM Task WHERE id_assignment = ?)
       WHERE id = ?`,
      [id_assignment, id_assignment]
    );

  } catch (err) {
    console.error('Error a updateAssignmentTaskCount:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function createTask(nom, data_venciment, punts, descripcio, id_assignment) {
  let conn;

  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `INSERT INTO Task (nom, data_venciment, descripcio, punts, id_assignment) 
       VALUES (?, ?, ?, ?, ?)`,
      [nom, data_venciment, descripcio || null, punts, id_assignment,]
    );

    const [createdTask] = await conn.query(
      `SELECT * FROM Task WHERE id = ?`,
      [result.insertId]
    );

    await updateAssignmentTaskCount(id_assignment);

    return createdTask;

  } catch (err) {
    console.error(' Error a createTask:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function updateTask(nom, data_venciment, punts, descripcio, id_assignment, task_id) {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.query(
      `UPDATE Task 
       SET nom = ?, data_venciment = ?, punts = ?, descripcio = ?, id_assignment = ? 
       WHERE id = ?`,
      [nom, data_venciment, punts, descripcio || null, id_assignment, task_id]
    );
  } catch (err) {
    console.error('Error a updateTask:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteTask(task_id) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      `DELETE FROM Task WHERE id = ?`,
      [task_id]
    );
    await updateAssignmentTaskCount(id_assignment);
  } catch (err) {
    console.error('Error a deleteTask:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getAssignmentsBySubject(id_subject) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "SELECT * FROM Assignment WHERE id_subject = ?",
      [id_subject]
    );
    return result;

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getTasksbyAssignment(id_assignment) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "SELECT * FROM Task WHERE id_assignment = ?",
      [id_assignment]
    );
    return result;

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getGroupsbySubject(id_subject) {
  let conn;

  try {
    conn = await pool.getConnection();

    const rowsGroups = await conn.query(`
      SELECT 
        g.id  AS id_grup,
        g.nom AS nom_grup,
        sgp.id  AS id_subgroup,
        sgp.nom AS nom_subgrup
      FROM Grup g
      LEFT JOIN Subgrup sgp ON sgp.id_group = g.id
      WHERE g.id_subject = ?;
    `, [id_subject]);

    const groupsMap = {};

    for (const row of rowsGroups) {
      if (!groupsMap[row.id_grup]) {
        groupsMap[row.id_grup] = {
          id_grup: row.id_grup,
          name: row.nom_grup,
          students: [],
          subgroups: {}
        };
      }

      if (row.id_subgroup) {
        if (!groupsMap[row.id_grup].subgroups[row.id_subgroup]) {
          groupsMap[row.id_grup].subgroups[row.id_subgroup] = {
            id_group:row.id_grup,
            id_subgroup: row.id_subgroup,
            name: row.nom_subgrup,
            students: []
          };
        }
      }
    }

    const rowsSubgroupStudents = await conn.query(`
      SELECT
        sgp.id_group     AS id_grup,
        sgs.id_subgroup  AS id_subgroup,
        u.id             AS id_student,
        u.nom            AS nom_student
      FROM subgrup_student sgs
      JOIN Subgrup sgp ON sgp.id = sgs.id_subgroup
      JOIN User u ON u.id = sgs.id_student
      WHERE u.tipus = 'alumne';
    `);

    for (const row of rowsSubgroupStudents) {
      const group = groupsMap[row.id_grup];
      if (!group) continue;

      const subgroup = group.subgroups[row.id_subgroup];
      if (!subgroup) continue;

      const exists = subgroup.students.some(
        s => s.id_student === row.id_student
      );

      if (!exists) {
        subgroup.students.push({
          id_student: row.id_student,
          name: row.nom_student
        });
      }
    }

    const rowsGroupStudents = await conn.query(`
      SELECT
        sg.id_grup,
        u.id  AS id_student,
        u.nom AS nom_student
      FROM student_grup sg
      JOIN User u ON u.id = sg.id_student
      WHERE u.tipus = 'alumne';
    `);

    for (const row of rowsGroupStudents) {
      const group = groupsMap[row.id_grup];
      if (!group) continue;

      const exists = group.students.some(
        s => s.id_student === row.id_student
      );

      if (!exists) {
        group.students.push({
          id_student: row.id_student,
          name: row.nom_student
        });
      }
    }

    return groupsMap;

  } catch (err) {
    console.error("Error getGroupsbySubject:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function createOrUpdateSubgrup(id_subgroup, id_group, name, students) {
  let conn;

  try {
    conn = await pool.getConnection();

    let finalSubgroupId = id_subgroup;

    if (id_subgroup) {
      await conn.query(
        `
        UPDATE Subgrup
        SET id_group = ?, nom = ?
        WHERE id = ?
        `,
        [id_group, name, id_subgroup]
      );
      await conn.query(
        `
        DELETE FROM subgrup_student
        WHERE id_subgroup = ?
        `,
        [id_subgroup]
      );

    } else {
      const result = await conn.query(
        `
        INSERT INTO Subgrup (id_group, nom, avatar_url)
        VALUES (?, ?, '/src/img/avatars/1.jpeg')
        `,
        [id_group, name]
      );

      finalSubgroupId = parseInt(result.insertId, 10);
    }

    if (students && students.length > 0) {
      for (const student of students) {
        await conn.query(
          `
          INSERT INTO subgrup_student (id_subgroup, id_student)
          VALUES (?, ?)
          `,
          [finalSubgroupId, student.id_student]
        );
      }
    }
    return finalSubgroupId;

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Error a createOrUpdateSubgrup:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function updateSubgrupName(id_subgroup, name) {
  let conn;

  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "UPDATE Subgrup SET nom = ? WHERE id = ?",
      [name, id_subgroup]
    );
    return result;
  } catch (err) {
    console.error("Error a updateSubgrupName:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function deleteSubgrup(id_subgroup) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "DELETE FROM subgrup_student WHERE id_subgroup = ?",
      [id_subgroup]
    );
    await conn.query(
      "DELETE FROM subgrup_entrega_tasca WHERE id_subgroup = ?",
      [id_subgroup]
    );

    const result = await conn.query(
      "DELETE FROM Subgrup WHERE id = ?",
      [id_subgroup]
    );
    return result;

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Error a deleteSubgrup:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function getAssignmentsAndTasks(id_subject) {
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT 
        a.id AS assignment_id,
        a.nom AS assignment_name,
        a.data_venciment AS assignment_due_date,
        a.insignia,
        a.descripcio AS descripcio_assignment,
        t.id AS task_id,
        t.nom AS task_name,
        t.punts AS task_points,
        t.data_venciment AS task_due_date,
        t.descripcio AS descripcio_task
     FROM Assignment a
     LEFT JOIN Task t
       ON t.id_assignment = a.id
     WHERE a.id_subject = ?;`,
      [id_subject]
    );

    const assignments = {};

    for (const row of rows) {
      if (!assignments[row.assignment_id]) {
        assignments[row.assignment_id] = {
          id_assignment: row.assignment_id,
          name: row.assignment_name,
          data_venciment: row.assignment_due_date,
          insignia: row.insignia,
          descripcio: row.descripcio_assignment,
          tasks: []
        };
      }

      if (row.task_id) {
        assignments[row.assignment_id].tasks.push({
          id_task: row.task_id,
          name: row.task_name,
          punts: row.task_points,
          data_venciment: row.task_due_date,
          descripcio: row.descripcio_task
        });
      }
    }

    return assignments;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Error a getAssignmentsAndTaks:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function getTaskStatusDict(id_subject) {
  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `
      SELECT 
        sg.id AS id_subgroup,
        a.id AS id_assignment,
        t.id AS id_task,
        s.estat,
        s.comentari
      FROM Subgrup sg
      JOIN Grup g ON g.id = sg.id_group
      JOIN Assignment a ON a.id_subject = g.id_subject
      JOIN Task t ON t.id_assignment = a.id
      LEFT JOIN subgrup_entrega_tasca s
        ON s.id_subgroup = sg.id AND s.id_task = t.id
      WHERE g.id_subject = ?;
      `,
      [id_subject]
    );
    const dict = {};

    for (const row of rows) {
      if (!dict[row.id_subgroup]) dict[row.id_subgroup] = {};
      if (!dict[row.id_subgroup][row.id_assignment]) dict[row.id_subgroup][row.id_assignment] = {};

      dict[row.id_subgroup][row.id_assignment][row.id_task] = {
        estat: row.estat || 'empty',
        comentari: row.comentari || ""
      };
    }

    return dict;

  } catch (err) {
    console.error("Error a getTaskStatusDict:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function evaluateTask(id_subgroup, id_task, estat) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `
      INSERT INTO subgrup_entrega_tasca (id_subgroup, id_task, estat, comentari)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE estat = VALUES(estat)
      `,
      [id_subgroup, id_task, estat, ""]
    );

    return result;

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function addCommentTask(id_subgroup, id_task, comentari) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `
      INSERT INTO subgrup_entrega_tasca (id_subgroup, id_task, estat, comentari)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE comentari = VALUES(comentari)
      `,
      [id_subgroup, id_task, 'empty', comentari]
    );

    return result;

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

// ### AUX FUNCTIONS STUDENT###

async function getSubjectsByStudent(id_student) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `SELECT 
          s.id         AS id_subject,
          s.nom        AS nom_subject,
          sg.avatar_url AS avatar,
          s.id_teacher AS id_teacher,
          g.id         AS id_grup,
          g.nom        AS nom_grup,
          sg.id        AS id_subgrup,
          sg.nom       AS nom_subgrup
       FROM subgrup_student ss
       JOIN Subgrup sg ON ss.id_subgroup = sg.id
       JOIN Grup g     ON sg.id_group = g.id
       JOIN Subject s  ON g.id_subject = s.id
       WHERE ss.id_student = ?;`,
      [id_student]
    );
    return result;   
  } catch (err) {
    console.error('Error a getSubjectsByStudent:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getOverviewStudent(id_student, id_subject, id_teacher, id_grup, id_subgrup ) {
  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `
      SELECT 
        sg.id AS id_subgroup,
        a.id  AS id_assignment,
        t.id  AS id_task,
        s.estat, s.comentari,
        t.descripcio
      FROM Subgrup sg
      JOIN Grup g ON g.id = sg.id_group
      JOIN Assignment a ON a.id_subject = g.id_subject
      JOIN Task t ON t.id_assignment = a.id
      LEFT JOIN subgrup_entrega_tasca s
        ON s.id_subgroup = sg.id 
       AND s.id_task = t.id
      WHERE 
            g.id_subject = ?
        AND g.id = ?
        AND sg.id = ?;
      `,
      [id_subject, id_grup, id_subgrup]
    );
   
    const taskStatusDict = {};

    for (const row of rows) {
      if (!taskStatusDict[row.id_assignment]) taskStatusDict[row.id_assignment] = {};

      taskStatusDict[row.id_assignment][row.id_task] = {
        estat: row.estat || 'empty',
        comentari: row.comentari || ""
      };
    }

    const assignmentsTasks = await getAssignmentsAndTasks(id_subject);

    return {taskStatusDict, assignmentsTasks}

  } catch (err) {
    console.error(" Error a getOverviewStudent:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
}

async function editAvatarStudent(id_subgrup, avatar_url) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `
      UPDATE Subgrup
      SET avatar_url = ?
      WHERE id = ?
      `,
      [avatar_url, id_subgrup]
    );
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Error a editAvatarStudent:", err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
  
}




// ### ENDPOINTS TEACHER ###

// --- Endpoint Login---
//Login request
app.post('/api/login', async (req, res) => {
  const { email_niu, password } = req.body;
  if (!email_niu || !password)
    return res.status(400).json({ message: 'Falten camps' });

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM User WHERE email_niu = ? AND password = ?",
      [email_niu, password]
    );
    if (rows.length > 0)
      res.status(200).json({ message: 'Login correcte!', logged: true, user: rows[0] });
    else
      res.status(401).json({ message: 'Usuari o contrasenya incorrectes', logged: false });

  } catch (err) {
    res.status(500).json({ message: 'Error intern del servidor', logged: false });
  } finally {
    if (conn) conn.release();
  }
});

// ---Endpoint teacher-dashboard---
//Mounted
app.get('/api/teacher-dashboard', async (req, res) => {
  const { id_teacher } =req.query;
  if (!id_teacher)
    return res.status(400).json({ message: "No s'ha trobat id_teacher" });

  try {
    const subjects = await getSubjectsbyTeacher(id_teacher);
    res.status(200).json({ message: 'Assignatures obtingudes correctament!', subjects });
  } catch (err) {
    res.status(500).json({ message: 'Error intern obtenint assignatures' });
  }
});
// Delete subject 
app.post('/api/teacher-delete-subject', async (req, res) => {
  const {id_subject } = req.body;
  if (!id_subject)
    return res.status(400).json({ message: "No s'ha trobat id_teacher o id_subject" });

  try {
    await deleteSubject(id_subject);
    res.status(200).json({ message: 'Assignatura eliminada correctament!' });
  } catch (err) {
    res.status(500).json({ message: 'Error intern eliminant assignatura' });
  }
});
// ---Endpoint de teacher-subject---
//Mounted
app.get('/api/teacher-subject', async (req, res) => {
  const { id_subject } = req.query

  if (!id_subject) {
    return res.status(400).json({
      message: "No s'ha trobat id_subject"
    })
  }

  try {
    const assignments = await getAssignmentsBySubject(id_subject)

    return res.status(200).json({
      message: 'Assignments obtinguts correctament!',
      assignments
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern obtenint assignments'
    })
  }
})
// Add subject + CSV upload
app.post('/api/add-subject', upload.single('file'), async (req, res) => {

  if (!req.file)
    return res.status(400).json({ message: "No s'ha rebut cap fitxer" });

  let id_subject;
  try {
    const { subjectName, subjectDescription, id_teacher } = req.body;
    id_subject = await populaSubject(subjectName, subjectDescription, id_teacher);

  } catch (err) {
    return res.status(400).json({ message: err });
  }

  const csvPath = req.file.path;
  const rows = [];

  fs.createReadStream(csvPath)
    .pipe(parse({ delimiter: ",", columns: true }))
    .on("data", (r) => rows.push(r))
    .on("end", async () => {
      fs.unlinkSync(csvPath);

      for (const student of rows) {
        const groupId = await getOrCreateGrup(student.Grups, id_subject);
        const studentId = await getOrCreateStudent(student);
        await linkStudentGroup(studentId, groupId);
      }

      res.status(200).json({ message: "Dades processades correctament!" });
    })
    .on("error", err => {
      res.status(500).json({ message: "Error processant dades" });
    });
});
// Add assignment
app.post('/api/add-assignment', async (req, res) => {
  try {
    const { assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions, id_assignment } = req.body;
    let newAssignment;
    if (id_assignment) {
      newAssignment = await updateAssignment(assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions, id_assignment);
    }
    else {
      newAssignment = await createAssignment(assignmentName, assignmentDescription, assignmentDate, id_subject, assignmentTasks, assignmentInsignia, assignmentSessions);
    }
    return res.status(200).json({
      message: "Task creada correctament!",
      assignment: newAssignment
    });
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err });
  }
});

// ---ENDPOINT de teacher-edit-subject---
//Mounted
app.get('/api/teacher-edit-assignment', async (req, res) => {

  const { id_assignment } = req.query

  if (!id_assignment) {
    return res.status(400).json({
      message: "No s'ha trobat id_assignment"
    })
  }

  try {
    const tasks = await getTasksbyAssignment(id_assignment)

    return res.status(200).json({
      message: 'Tasks obtingudes correctament!',
      tasks
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern obtenint tasks'
    })
  }
})
//Add task
app.post('/api/add-task', async (req, res) => {
  try {
    const { nom, data_venciment, punts, descripcio, id_assignment } = req.body;

    const newTask = await createTask(nom, data_venciment, punts, descripcio, id_assignment);

    return res.status(200).json({
      message: "Task creada correctament!",
      id: newTask
    });

  } catch (err) {
    console.error("Error creant task:", err);
    return res.status(500).json({
      message: "Error intern creant la task"
    });
  }
});
//Update task
app.post('/api/update-task', async (req, res) => {
  try {
    const { nom, data_venciment, punts, descripcio, id_assignment, task_id } = req.body;

    const newTask = await updateTask(nom, data_venciment, punts, descripcio, id_assignment, task_id);

    return res.status(200).json({
      message: "Task creada correctament!",
      task: newTask
    });

  } catch (err) {
    console.error("Error creant task:", err);
    return res.status(500).json({
      message: "Error intern creant la task"
    });
  }
});
//Delete task
app.post('/api/delete-task', async (req, res) => {
  try {
    const { task_id } = req.body;

    await deleteTask(task_id);

    return res.status(200).json({
      message: "Task eliminada correctament!"
    });

  } catch (err) {
    console.error("Error eliminant task:", err);
    return res.status(500).json({
      message: "Error intern eliminant la task"
    });
  }
});

// ---Endpoint de teacher-people---
//Mounted
app.get('/api/teacher-people', async (req, res) => {

  const { id_subject } = req.query

  if (!id_subject) {
    return res.status(400).json({
      message: "No s'ha trobat id_subject"
    })
  }

  try {
    const groups = await getGroupsbySubject(id_subject)

    return res.status(200).json({
      message: `Groups de subject ${id_subject} obtingudes correctament!`,
      groups
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern obtenint groups'
    })
  }
})
//Subgroup creation
app.post('/api/create-subgroup', async (req, res) => {
  
  const { id_subgroup, id_group, name, students } = req.body;


  if (!id_group || !name || !students) {
    return res.status(400).json({ message: "Falten camps: id_group o name" });
  }

  try {
    await createOrUpdateSubgrup( id_subgroup, id_group, name, students)
    res.status(200).json({ message: "Creat subgrup" });;

  } catch (err) {
    console.error("Error creant subgrup:", err);
    res.status(500).json({ message: "Error intern creant subgrup" });
  }
});
//Subgroup name update
app.post('/api/update-subgroup-name',async (req, res) => {
  const { id_subgroup, name } = req.body;

  if (!id_subgroup || !name) {
    return res.status(400).json({ message: "Falten camps: id_subgroup o name" });
  }

  try {
    await updateSubgrupName( id_subgroup, name )
    res.status(200).json({ message: "Nom subgrup modificat" });;

  } catch (err) {
    console.error("Error modificant nom subgrup:", err);
    res.status(500).json({ message: "Error intern modificant nom subgrup" });
  }
});
//Subgroup delete
app.post('/api/delete-subgroup',async (req, res) => {
  const { id_subgroup } = req.body;

  if (!id_subgroup) {
    return res.status(400).json({ message: "Falten camps: id_subgroup" });
  }

  try {
    await deleteSubgrup( id_subgroup )
    res.status(200).json({ message: "Nom subgrup modificat" });;

  } catch (err) {
    console.error("Error eliminant subgrup:", err);
    res.status(500).json({ message: "Error intern eliminant subgrup" });
  }
});

// ---Endpoint de teacher-evaluation---
//Mounted
app.get('/api/teacher-evaluation', async (req, res) => {
  const { id_subject } = req.query;

  if (!id_subject) {
    return res.status(400).json({
      message: "No s'ha trobat id_subject"
    });
  }

  try {
    const assignments_tasks = await getAssignmentsAndTasks(id_subject);

    const taskStatusDict = await getTaskStatusDict(id_subject);

    return res.status(200).json({
      message: `Assignments_tasks de subject ${id_subject} obtingudes correctament!`,
      assignments_tasks,
      taskStatusDict
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Error intern obtenint Assignments_tasks'
    });
  }
});
//Evaluate task
app.post('/api/evaluate-task', async (req, res) => {

  const {id_subgroup, id_task, estat } = req.body

  if (!id_subgroup || !id_task || !estat) {
    return res.status(400).json({
      message: "Falten paràmetres"
    });
  }

  try {
    await evaluateTask( id_subgroup, id_task, estat)
    return res.status(200).json({
      message: `Avalució de la tasca ${id_task} correcte!`,
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern a evaluateTask'
    })
  }
})
//Add comment
app.post('/api/save-task-comment', async (req, res) => {
  const { id_subgroup, id_task, comentari } = req.body

  if (!id_subgroup || !id_task || !comentari) {
    return res.status(400).json({
      message: "Falten paràmetres"
    });
  }

  try {
    await addCommentTask( id_subgroup, id_task, comentari )
    return res.status(200).json({
      message: `Comentari de la tasca ${id_task} correcte!`,
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern a addCommentTask'
    })
  }
})

// ### ENDPOINTS STUDENT ###

// ---Endpoint student-dashboard---
//Mounted
app.post('/api/student-dashboard', async (req, res) => {
  const { id_student } = req.body;
  if (!id_student)
    return res.status(400).json({ message: "No s'ha trobat id_student" });
  try {
    const subjects = await getSubjectsByStudent(id_student);
    res.status(200).json({ message: 'Assignatures obtingudes correctament!', subjects });
  } catch (err) {
    res.status(500).json({ message: 'Error intern obtenint assignatures' , err});
  }
});

// ---Endpoint student-subjects---
//Mounted
app.post('/api/student-subjects', async (req, res) => {
  const { id_student, id_subject, id_teacher, id_grup, id_subgrup } = req.body

  if (!id_student && !id_subject && !id_teacher && !id_grup && !id_subgrup ) {
    return res.status(400).json({
      message: "No s'ha trobat id_student, id_subject, id_teacher, id_grup, id_subgrup"
    })
  }
  try {
    const { taskStatusDict, assignmentsTasks } = await getOverviewStudent(id_student, id_subject, id_teacher, id_grup, id_subgrup )
    return res.status(200).json({
      message: 'Overview obtinguts correctament!',
      taskStatusDict,
      assignmentsTasks
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern obtenint overview'
    })
  }
})

// ---Endpoint student-edit-avatar---
//Edit avatar
app.post('/api/student-edit-avatar', async (req, res) => {
  const {id_subgrup, avatar_url } = req.body

  if (!id_subgrup && !avatar_url) {
    return res.status(400).json({message: "No s'ha trobat id_subgrup, id_avatar" })
  }
  try {
    await editAvatarStudent(id_subgrup, avatar_url)
    return res.status(200).json({
      message: 'Avatar modificat correctament!',
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Error intern editant avatar'
    })
  }
})

// ### SERVER START ###
app.listen(port, async () => {
  console.log(`Backend corrent a http://localhost:${port}`);
  //await populaDB();
});

