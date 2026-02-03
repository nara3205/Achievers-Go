<script>
import MenuBar from "../student_menu_bar/MenuBar.vue";

export default {
  components: { MenuBar },

  data() {
    return {
      user: JSON.parse(localStorage.getItem("loggedUser")),
      subject: JSON.parse(localStorage.getItem("actualSubject")),
      overviewTotal: null,
      taskStatusDict: {},
      assignmentsTasks: {},
      assignmentInfo: false
    };
  },

  mounted() {
    this.loadOverview();
  },

  methods: {
    async loadOverview() {
      try {
        const res = await fetch("http://localhost:8000/api/student-subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_student: this.user.id,
            id_subject: this.subject.id_subject,
            id_teacher: this.subject.id_teacher,
            id_grup: this.subject.id_grup,
            id_subgrup: this.subject.id_subgrup
          }),
        });

        const { taskStatusDict = {}, assignmentsTasks = {} } = await res.json();
        this.taskStatusDict = taskStatusDict
        this.assignmentsTasks = assignmentsTasks
        console.log(taskStatusDict, assignmentsTasks)

        const overview = {
          assignments: {},
          totals: { doneTasks: 0, donePoints: 0, totalPoints: 0 },
        };

        Object.entries(taskStatusDict).forEach(async ([id, status]) => {
          const info = assignmentsTasks[id];
          if (!info) return;

          const totalTasks = info.tasks.length;
          const totalPoints = info.tasks.reduce((s, t) => s + t.punts, 0);

          let doneTasks = 0;
          let donePoints = 0;

          info.tasks.forEach(t => {
            const s = status?.[t.id_task];
            if (!s || s.estat === "empty") return;
            doneTasks++;
            if (s.estat === "ontime") donePoints += t.punts;
          });

          const insignia = await this.getInsignia(info.insignia, doneTasks, totalTasks)

          overview.assignments[info.name] = {
            doneTasks,
            totalTasks,
            donePoints,
            totalPoints,
            insignia,
            id_assignment: id,
          };

          overview.totals.doneTasks += doneTasks;
          overview.totals.donePoints += donePoints;
          overview.totals.totalPoints += totalPoints;
        });
        this.overviewTotal = overview;
      } catch (err) {
        console.error("Error loading overview:", err);
      }
    },
    async getInsignia(insignia, doneTasks, totalTasks) {
      const p = doneTasks / totalTasks || 0;
      const file = `/src/img/insignies/${p === 0 ? `${insignia}_1.png` :
        p < 0.5 ? `${insignia}_2.png` :
          p < 1 ? `${insignia}_3.png` :
            `${insignia}_4.png`
        }`;
      return file
    },
    goToAssignment(id_assignment) {
      this.assignmentInfo = id_assignment
    }
  },
};
</script>

<template>
  <div class="menu-bar">
    <MenuBar :show_clear_bar="true" :subject-text="subject.nom_subject" :avatar="subject.avatar" />
  </div>

  <div v-if="overviewTotal" class="dashboard">
    <div v-if="!assignmentInfo" class="overview">
      <div class="profile">
        <img :src="subject.avatar || '/src/img/avatars/1.jpeg'" class="avatar" />

        <p class="subgroup">
          Subgrup Assignat:
          <strong>{{ subject.nom_subgrup }}</strong>
        </p>

        <p class="mini-points">
          {{ overviewTotal.totals.donePoints }}/{{ overviewTotal.totals.totalPoints }} punts
        </p>

        <div class="points-box">
          <div class="points-value">
            {{ overviewTotal.totals.donePoints }}/{{ overviewTotal.totals.totalPoints }}
          </div>
          <div class="points-label">Punts</div>
        </div>
      </div>
      <div class="cards">
        <div v-for="(assignment, name) in overviewTotal.assignments" :key="name" class="card"
          @click="goToAssignment(assignment.id_assignment)">
          <div class="card-title">
            <span class="material-icons"></span>
            {{ name }}
          </div>

          <div class="card-status">
            <img :src="assignment.insignia" class="insignia-img" alt="Insignia" />
          </div>

          <div class="progress-line">
            <div class="progress-fill" :style="{ width: (assignment.doneTasks / assignment.totalTasks) * 100 + '%' }" />
          </div>
          <div class="card-footer">
            {{ assignment.doneTasks }}/{{ assignment.totalTasks }} Tasques completades
          </div>
        </div>
      </div>
    </div>
    <div v-else class="assignment-view">

      <div class="back-btn" @click="assignmentInfo = false">←</div>

      <div class="assignment-card">

        <div class="assignment-header">

          <div class="badge">
            <img :src="overviewTotal.assignments[assignmentsTasks[assignmentInfo].name]?.insignia" alt="badge" />
            <span>Almost there!</span>
          </div>
          <div class="assignment-info">
            <h2>{{ assignmentsTasks[assignmentInfo].name }}</h2>
            <p class="due-date">
              Data de venciment:
              <strong>{{ assignmentsTasks[assignmentInfo].data_venciment }}</strong>
            </p>
          </div>
        </div>
        <div class="tasks">
          <div v-for="task in assignmentsTasks[assignmentInfo]?.tasks" :key="task.id_task" class="task-card">
            <div class="task-header">
              <div class="task-title">
                <span class="task-icon">📄</span>
                <strong>{{ task.name }}</strong>
              </div>
            <div class="task-points">
              {{
                taskStatusDict[assignmentInfo][task.id_task]?.estat === 'ontime'
                  ? task.punts
              : 0
              }}/{{ task.punts }} punts
            </div>

              <div class="task-status" :class="taskStatusDict[assignmentInfo][task.id_task]?.estat">
                {{ taskStatusDict[assignmentInfo][task.id_task]?.estat || 'pendent' }}
              </div>
            </div>
            <p class="task-desc">
              {{ task.descripcio || 'Sense descripció' }}
            </p>
            <div class="task-footer">
              <span>Data de venciment: {{ task.data_venciment || 'dd/mm/aa' }}</span>
              <span class="task-comment">
                💬 {{ taskStatusDict[assignmentInfo][task.id_task]?.comentari || 'Sense comentari' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>



  </div>
</template>

<style scoped>
.dashboard {
  padding: 150px 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile {
  text-align: center;
  margin-bottom: 50px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid #6fa6a1;
  object-fit: cover;
}

.subgroup {
  margin-top: 10px;
  font-size: 14px;
  color: #5a5a5a;
}

.mini-points {
  font-size: 13px;
  color: #777;
}

.points-box {
  margin: 20px auto 0;
  background: #bcd9d6;
  border: 3px solid #6fa6a1;
  border-radius: 22px;
  width: 180px;
  padding: 16px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
}

.points-value {
  font-size: 30px;
  font-weight: 600;
}

.points-label {
  font-size: 13px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  width: 100%;
  max-width: 900px;
}

.card {
  border: 3px solid #6fa6a1;
  border-radius: 28px;
  padding: 20px 26px 26px;
  background: #ffffff;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 14px;
}

.card-status {
  border: 2px solid #bcd9d6;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  margin-bottom: 16px;
}

.progress-line {
  height: 4px;
  background: #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6fa6a1;
  transition: width 0.4s ease;
}

.card-footer {
  margin-top: 10px;
  font-size: 12px;
  color: #555;
}

.insignia-img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.assignment-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-btn {
  align-self: flex-start;
  margin-bottom: 20px;
  margin-top: 60px;
  margin-left: 200px;
  cursor: pointer;

  width: 50px;
  height: 50px;
  border-radius: 50%;

  background-color: #6fa6a1;
  color: white;

  font-size: 28px;
  /* 🔥 més petit */
  font-weight: bold;
  line-height: 1;
  /* 🔥 elimina desplaçament vertical */

  display: flex;
  align-items: center;
  justify-content: center;
}

.assignment-card {
  width: 100%;
  max-width: 950px;
  background: white;
  border-radius: 28px;
  border: 3px solid #6fa6a1;
  padding: 28px 34px;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.15);
}

.assignment-header {
  display: grid;
  grid-template-columns: 130px 1fr 40px;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #f4f9f8;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.12);
}

.badge img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.badge span {
  font-size: 12px;
  font-weight: 600;
}

.assignment-info h2 {
  margin: 0;
  font-size: 22px;
}

.due-date {
  margin-top: 6px;
  font-size: 14px;
  color: #4f7f7a;
}

.tasks {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-card {
  background: #f7fbfb;
  border: 2px solid #cfe5e2;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease;
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.task-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.task-status.ontime {
  background: #d6f3e9;
  color: #1f8f6a;
}

.task-status.late {
  background: #ffe1e1;
  color: #b52b2b;
}

.task-status.empty,
.task-status.pendent {
  background: #eee;
  color: #666;
}

.task-desc {
  margin: 10px 0;
  font-size: 14px;
  color: #444;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}

.task-comment {
  font-style: italic;
}
</style>
