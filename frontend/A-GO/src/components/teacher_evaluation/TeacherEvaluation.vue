<script>
import MenuBar from "../teacher_menu_bar/MenuBar.vue";

export default {
  components: { MenuBar },

  data() {
    return {
      groups: {},

      selectedGroupId: null,
      selectedSubgroupId: null,

      subject: JSON.parse(localStorage.getItem("actualSubject")) || null,
      expandedGroups: {},

      assignmentsTasks: {},
      taskStatusDict: {},
      activeComment: {},
      commentText: "",

      hasChanges: false,
      savingComment: false,
      sortByDate: false,
      activeTab: "evaluation",

      overviewTotal: {},
      commentPosition: { x: 0, y: 0 },


    };
  },

  async mounted() {
    this.init()
  },

  computed: {
    assignmentsList() {
      return Object.values(this.assignmentsTasks || {});
    },

    assignmentsWithTasks() {
      const list = this.assignmentsList.filter(
        ass => ass.tasks && ass.tasks.length > 0
      );

      if (!this.sortByDate) return list;
      return [...list].sort(
        (a, b) => new Date(a.data_venciment) - new Date(b.data_venciment)
      );
    },

    activeSubgroups() {
      if (!this.selectedGroupId) return [];
      return Object.values(this.groups[this.selectedGroupId]?.subgroups || {});
    }
  },

  methods: {
    async init() {
      await this.loadGroups();
      await this.loadAssignmentsAndTasks();
      this.loadTotalOverview();
    },

    async loadGroups() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/teacher-people?id_subject=${this.subject.id_subject}`
        );
        if (!res.ok) throw new Error("Error carregant grups");
        const data = await res.json();
        this.groups = data.groups;
      } catch (err) {
        console.error(err);
      }
    },

    async loadAssignmentsAndTasks() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/teacher-evaluation?id_subject=${this.subject.id_subject}`
        );
        if (!res.ok) throw new Error("Error assignments_tasks");
        const data = await res.json();
        this.assignmentsTasks = data.assignments_tasks;
        this.taskStatusDict = data.taskStatusDict
      } catch (err) {
        console.error(err);
      }
    },

    loadTotalOverview() {

      Object.entries(this.taskStatusDict).forEach(([subgroupId, assignments]) => {
        let totalDoneTasks = 0;
        let totalDonePoints = 0;

        this.overviewTotal[subgroupId] = {
          assignments: {},
          totals: {
            doneTasks: 0,
            donePoints: 0
          }
        };

        Object.entries(assignments).forEach(([assignmentId, tasksStatus]) => {
          const assignmentInfo = this.assignmentsTasks[assignmentId];
          if (!assignmentInfo) return;

          const totalTasks = assignmentInfo.tasques_totals || assignmentInfo.tasks.length;
          const totalPoints = assignmentInfo.tasks.reduce(
            (sum, t) => sum + t.punts,
            0
          );

          let doneTasks = 0;
          let donePoints = 0;

          assignmentInfo.tasks.forEach(task => {
            const status = tasksStatus?.[task.id_task];

            if (!status || status.estat === "empty") return;

            doneTasks++;

            if (status.estat === "ontime") {
              donePoints += task.punts;
            }
          });

          this.overviewTotal[subgroupId].assignments[assignmentInfo.name] = {
            doneTasks,
            totalTasks,
            donePoints,
            totalPoints
          };

          totalDoneTasks += doneTasks;
          totalDonePoints += donePoints;
        });

        this.overviewTotal[subgroupId].totals.doneTasks = totalDoneTasks;
        this.overviewTotal[subgroupId].totals.donePoints = totalDonePoints;
      });
    },

    toggleGroup(id) {
      this.expandedGroups = { [id]: !this.expandedGroups[id] };
      this.selectedGroupId = id;
      this.selectedSubgroupId = null;
    },

    selectSubgroup(id) {
      this.selectedSubgroupId = id;
    },

    toggleSort() {
      this.sortByDate = !this.sortByDate;
    },

    async evaluateTask(id_subgroup, id_task, estat) {
      try {
        const body = {
          id_subgroup: id_subgroup,
          id_task: id_task,
          estat: estat
        };

        const res = await fetch("http://localhost:8000/api/evaluate-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Error evaluating task");
        await this.loadAssignmentsAndTasks();
        this.loadTotalOverview();


      } catch (err) {
        console.error("Error avaluant tasca:", err);
      }
    },

    openComment(id_subgroup, id_task, id_assignment, event) {
      this.activeComment = {
        id_subgroup,
        id_task
      };

      this.commentText =
        this.taskStatusDict[id_subgroup]?.[id_assignment]?.[id_task]?.comentari || "";

      this.commentPosition = {
        x: event.clientX + 10,
        y: event.clientY + 10
      };
    },


    closeComment() {
      this.savingComment = false;
      this.activeComment = {};
    },

    async saveComment(id_subgroup, id_task) {
      try {
        const body = {
          id_subgroup: id_subgroup,
          id_task: id_task,
          comentari: this.commentText
        };
        const res = await fetch("http://localhost:8000/api/save-task-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Error saving comment task");
        this.savingComment = true
        this.loadAssignmentsAndTasks();
        this.closeComment()

      } catch (err) {
        this.savingComment = false;
        console.error("Error avaluant tasca:", err);
      }
    }

  }
};
</script>

<template>
  <div class="menu-bar">
    <MenuBar :show_clear_bar="true" :subject-text="subject.nom_subject" />
  </div>

  <div class="layout">
    <aside class="groups-section">
      <h2>Alumnat</h2>

      <div class="grups-container">
        <div v-for="(group, id_group) in groups" :key="id_group" class="grup-card">
          <div class="grup-header" @click="toggleGroup(id_group)">
            <div class="grup-title">{{ group.name }}</div>
          </div>

          <div class="subgrups-container" v-if="expandedGroups[id_group]">
            <div v-for="(subgroup, id_subgroup) in group.subgroups" :key="id_subgroup" class="subgrup-item"
              @click.stop="selectSubgroup(id_subgroup)" :class="{ selected: selectedSubgroupId === id_subgroup }">
              {{ subgroup.name }}
            </div>

          </div>
        </div>
      </div>
    </aside>

    <div class="right-panel">
      <section v-if="!selectedGroupId" class="progress-table empty-state">
        <h2>Avaluació disponible</h2>
        <p>Selecciona un grup amb tasques per avaluar</p>
      </section>
      <div v-else class="tabs">
        <button class="tab" :class="{ active: activeTab === 'evaluation' }" @click="activeTab = 'evaluation'">
          Avaluació
        </button>

        <button class="tab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          Overview progress
        </button>
      </div>
      <div v-if="selectedGroupId && activeTab === 'evaluation'">
        <div class="sort-bar" v-if="assignmentsWithTasks.length">
          <button @click="toggleSort">
            {{ sortByDate ? "Ordre normal" : "Ordenar per data" }}
          </button>
        </div>

        <div v-if="assignmentsWithTasks.length" class="evaluation-guide">
          <strong>Guia:</strong> 1 = A temps | 2 = Fora de temps | 3 = No entregat
        </div>

        <table v-if="selectedGroupId && assignmentsWithTasks.length" class="progress-table">
          <thead>
            <tr>
              <th rowspan="2">Student Groups</th>

              <th v-for="ass in assignmentsWithTasks" :key="ass.id_assignment" :colspan="ass.tasks.length">
                {{ ass.name || ("Assignment " + ass.id_assignment) }}
              </th>
            </tr>

            <tr>
              <template v-for="ass in assignmentsWithTasks" :key="ass.id_assignment">
                <th v-for="task in ass.tasks" :key="task.id_task">
                  {{ task.name }}
                </th>
              </template>
            </tr>
          </thead>

          <tbody>
            <tr v-for="sub in activeSubgroups" :key="sub.id_subgroup">
              <td class="subgroup-name tooltip-container">
                {{ sub.name }}

                <div class="students-tooltip" v-if="sub.students && sub.students.length">
                  <ul>
                    <li v-for="student in sub.students" :key="student.id_student">
                      {{ student.name }}
                    </li>
                  </ul>
                </div>
              </td>

              <template v-for="ass in assignmentsWithTasks" :key="ass.id_assignment">
                <td v-for="task in ass.tasks" :key="task.id_task" class="cell">
                  <div class="checks">
                    <label>
                      <input type="radio" :name="`eval-${sub.id_subgroup}-${task.id_task}`"
                        :checked="taskStatusDict[sub.id_subgroup]?.[ass.id_assignment]?.[task.id_task]?.estat === 'ontime'"
                        @change="evaluateTask(sub.id_subgroup, task.id_task, 'ontime')" />
                      1
                    </label>

                    <label>
                      <input type="radio" :name="`eval-${sub.id_subgroup}-${task.id_task}`"
                        :checked="taskStatusDict[sub.id_subgroup]?.[ass.id_assignment]?.[task.id_task]?.estat === 'offtime'"
                        @change="evaluateTask(sub.id_subgroup, task.id_task, 'offtime')" />
                      2
                    </label>

                    <label>
                      <input type="radio" :name="`eval-${sub.id_subgroup}-${task.id_task}`"
                        :checked="taskStatusDict[sub.id_subgroup]?.[ass.id_assignment]?.[task.id_task]?.estat === 'empty'"
                        @change="evaluateTask(sub.id_subgroup, task.id_task, 'empty')" />
                      3
                    </label>
                    <div class="comentari">
                      <span @click="openComment(sub.id_subgroup, task.id_task, ass.id_assignment, $event)"
                        class="comment-icon">
                        💬
                      </span>

                      <div
                        v-if="activeComment.id_task === task.id_task && activeComment.id_subgroup === sub.id_subgroup"
                        class="comment-editor" :style="{
                          top: commentPosition.y + 'px',
                          left: commentPosition.x + 'px'
                        }">
                        <textarea v-model="commentText" placeholder="Escriu un comentari..."></textarea>
                        <div class="comment-actions">
                          <button @click="saveComment(sub.id_subgroup, task.id_task)" :disabled="savingComment">
                            Guardar
                          </button>
                          <button @click="closeComment">Cancel·lar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

              </template>
            </tr>
          </tbody>
        </table>

        <section v-else class="progress-table empty-state">
          <h2>Avaluació disponible</h2>
          <p>Selecciona un grup amb tasques per avaluar</p>
        </section>
      </div>
      <div v-if="selectedGroupId && activeTab === 'overview'" class="overview-panel">

        <div class="overview-grid">

          <div v-for="sub in activeSubgroups" :key="sub.id_subgroup" class="overview-card">
            <div class="overview-header">
              <h3 class="tooltip-container">
                {{ sub.name }}

                <div class="students-tooltip" v-if="sub.students && sub.students.length">
                  <ul>
                    <li v-for="student in sub.students" :key="student.id_student">
                      {{ student.name }}
                    </li>
                  </ul>
                </div>
              </h3>

              <div class="overview-score">
                <strong>
                  {{ overviewTotal[sub.id_subgroup]?.totals?.doneTasks || 0 }}
                  /
                  {{Object.values(overviewTotal[sub.id_subgroup]?.assignments || {})
                    .reduce((sum, a) => sum + a.totalTasks, 0)}}
                </strong>
                <span>
                  {{ overviewTotal[sub.id_subgroup]?.totals?.donePoints || 0 }} pts
                </span>
              </div>
            </div>

            <div class="overview-progress">
              <div class="progress-label">
                <span>Progress</span>
                <span>
                  {{
                    Math.round(
                      (
                        (overviewTotal[sub.id_subgroup]?.totals?.doneTasks || 0) /
                        (Object.values(overviewTotal[sub.id_subgroup]?.assignments || {})
                          .reduce((sum, a) => sum + a.totalTasks, 0) || 1)
                      ) * 100
                    )
                  }}%
                </span>
              </div>

              <div class="progress-bar">
                <div class="progress-fill" :style="{
                  width:
                    (
                      (overviewTotal[sub.id_subgroup]?.totals?.doneTasks || 0) /
                      (Object.values(overviewTotal[sub.id_subgroup]?.assignments || {})
                        .reduce((sum, a) => sum + a.totalTasks, 0) || 1)
                    ) * 100 + '%'
                }"></div>
              </div>
            </div>

            <div class="overview-assignments">
              <div v-for="(ass, name) in overviewTotal[sub.id_subgroup]?.assignments" :key="name"
                class="overview-assignment">
                <span>{{ name }}:</span>
                <span>
                  {{ ass.doneTasks }}/{{ ass.totalTasks }}
                  ({{ ass.donePoints }} pts)
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>


    </div>
  </div>
</template>


<style scoped>
.menu-bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: 64px;
  z-index: 1000;
}

.layout {
  margin-top: 135px;
  min-height: calc(100vh - 130px);
  padding: 32px;
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 32px;
  background-color: #f5f5f5;
}
.groups-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.groups-section h2 {
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
}

.grup-card {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.grup-header {
  padding: 16px;
  background: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.grup-header:hover {
  background: #f0f0f0;
}

.grup-title {
  font-size: 18px;
  font-weight: 600;
}

.subgrups-container {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
}

.subgrup-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.subgrup-item:hover {
  background: #f5fafa;
}

.subgrup-item.selected {
  background: #5f9c97;
  color: #fff;
  font-weight: 600;
}

.right-panel {
  background: transparent;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f2f2f2;
  cursor: pointer;
  font-size: 14px;
}

.tab:hover {
  background: #e9e9e9;
}

.tab.active {
  background: #5f9c97;
  color: #fff;
  border-color: #5f9c97;
}

.sort-bar {
  margin-bottom: 12px;
}

.sort-bar button {
  background: #5f9c97;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.sort-bar button:hover {
  background: #4b8681;
}

.evaluation-guide {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}
.progress-table {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  border-collapse: collapse;
  overflow: hidden;
}

.progress-table th,
.progress-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.progress-table thead th {
  background: #8fb9b5;
  color: #fff;
  font-weight: 600;
}

.subgroup-name {
  background: #f5f5f5;
  text-align: left;
  font-weight: 600;
}

.checks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}
.progress-table.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #999;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
}

.progress-table.empty-state h2 {
  margin-bottom: 8px;
  font-size: 22px;
  color: #666;
}

.progress-table.empty-state p {
  margin: 0;
  font-size: 16px;
}

.tooltip-container {
  position: relative;
}

.students-tooltip {
  display: none;
  position: fixed;
  pointer-events: none;
  background: white;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 180px;
  max-width: 260px;
  max-height: 220px;
  overflow-y: auto;
  font-size: 12px;
}

.tooltip-container:hover .students-tooltip {
  display: block;
}

.students-tooltip ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.students-tooltip li {
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
}

.comentari {
  position: relative;
  display: inline-block;
}

.comment-icon {
  cursor: pointer;
  font-size: 16px;
  margin-left: 6px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.comment-icon:hover {
  opacity: 1;
}

.comment-editor {
  position: fixed;
  top: 0;
  left: 24px;
  width: 220px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 100;
  border-radius: 6px;
}

.comment-editor textarea {
  width: 100%;
  min-height: 60px;
  resize: vertical;
  padding: 4px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
}

.overview-panel {
  padding: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.overview-card {
  background: #ffffff;
  border: 2px solid #9fc5c1;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.overview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.overview-score {
  text-align: right;
}

.overview-score strong {
  font-size: 20px;
  display: block;
}

.overview-score span {
  font-size: 13px;
  color: #666;
}

.overview-progress {
  margin-bottom: 14px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  color: #444;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #dcdfe3;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #5f9c97;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.overview-assignments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.overview-assignment {
  display: flex;
  justify-content: space-between;
}
</style>