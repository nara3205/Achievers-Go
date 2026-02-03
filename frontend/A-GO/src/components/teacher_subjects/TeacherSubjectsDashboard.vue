<script>
import AssignmentCreation from "./AssignmentCreation.vue";
import MenuBar from "../teacher_menu_bar/MenuBar.vue";

export default {
  components: { AssignmentCreation, MenuBar },

  data() {
    return {
      assignments: [],
      showForm: false,
      user: JSON.parse(localStorage.getItem("loggedUser")) || null,
      subject: JSON.parse(localStorage.getItem("actualSubject")) || null,
      showFormAssignment: null
    };
  },

  async mounted() {
    this.loadAssignments();
  },

  methods: {
    async loadAssignments() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/teacher-subject?id_subject=${this.subject.id_subject}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!res.ok) throw new Error("Error del servidor");

        const data = await res.json();
        this.assignments = data.assignments ?? [];
        console.log(this.assignments)

        for (const assignment of this.assignments) {
          try {
            const insignia = await import(`@/img/insignies/${assignment.insignia}.png`);
            assignment.insigniaSrc = insignia.default;
          } catch {
            const insignia = await import(`@/img/insignies/1.png`);
            assignment.insigniaSrc = insignia.default;
          }
        }
      } catch (err) {
        console.error("Error al obtenir assignments:", err);
      }
    },
    openSubjectForm(assignment) {
      this.showForm = !this.showForm;
      if (assignment) {
        this.showFormAssignment = assignment
      }
      else {
        this.showFormAssignment = null
      }
    },
    editAssignment(assignment) {
      localStorage.setItem("actualAssignment", JSON.stringify(assignment));
      this.$router.push({
        name: "TeacherEditAssignment",
        params: { subject: this.subject.id_subject, assignment: assignment.id }
      });
    },

  }
};
</script>

<template>
  <div class="menu-bar">
    <MenuBar :show_clear_bar="true" :subject-text="subject.nom_subject" />
  </div>

  <div class="teacher-subject" :style="{ paddingTop: '130px' }">
    <ul class="assignments-container" v-if="assignments.length">
      <li v-for="assignment in assignments" :key="assignment.id" class="assignment-card"
        @click="editAssignment(assignment)">
        <div class="assignment-icon">📄</div>

        <div class="assignment-main">
          <div class="assignment-top">
            <span class="assignment-title">{{ assignment.nom }}</span>
          </div>
          <div class="badge">
            <img class="badge-img" :src="assignment.insigniaSrc" alt="insignia" />
          </div>
          <div class="descripcio">
            {{ assignment.descripcio }}
          </div>
          <div class="assignment-tasks">
            Tasques: {{ assignment.tasques_totals }}
          </div>
          <div class="assignment-date">
            Data límit: {{ assignment.data_venciment }}
          </div>

        </div>
        <div class="assignment-edit">
          <button class="edit-btn" @click.stop="openSubjectForm(assignment)" title="Editar">
            ✏️
          </button>

        </div>
      </li>
    </ul>
  </div>

  <button class="plus-icon" @click="openSubjectForm(null)">+</button>

  <div v-if="showForm" class="subject-creation">
    <AssignmentCreation :user="user" :subject="subject" :showFormAssignment="showFormAssignment"
      @close="showForm = false" />
  </div>
</template>

<style scoped>

.menu-bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: 80px;
  z-index: 1000;
}

.teacher-subject {
  padding: 130px 20px 20px;
}


.assignments-container {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.assignment-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.assignment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.assignment-icon {
  font-size: 42px;
}


.assignment-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assignment-title {
  font-size: 20px;
  font-weight: 600;
}

.badge-img {
  width: 70px;
  height: 25px;
  object-fit: contain;
}

.descripcio {
  color: #777;
}

.assignment-date {
  font-size: 14px;
  color: #5f9c97;
}

.assignment-tasks {
  font-size: 14px;
  color: #777373;
}


.edit-btn {
  position: absolute;
  top: 10px;
  right: 12px;

  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;

  padding: 4px;
  border-radius: 6px;

}

.edit-btn:hover {
  background: #f0f7f6;
  color: #5f9c97;
  transform: scale(1.1);
}
.plus-icon {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #9bbdb9;
  border: none;
  font-size: 36px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.plus-icon:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
}
</style>
