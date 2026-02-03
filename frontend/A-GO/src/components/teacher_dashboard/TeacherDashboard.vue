<script>
import SubjectCreation from "./SubjectCreation.vue";
import MenuBar from "../teacher_menu_bar/MenuBar.vue"

export default {
  components: { SubjectCreation, MenuBar },

  data() {
    return {
      subjects: [],
      getSubjectsMessage: "",
      showForm: false,
      user: JSON.parse(localStorage.getItem("loggedUser")) || null,
    };
  },
  async mounted() {
    this.loadSubjects()
  },
  methods: {
    goToSubject(subject) {
      localStorage.setItem('actualSubject', JSON.stringify(subject))
      this.$router.push({
        name: "TeacherSubjectsDashboard",
        params: { id: this.user.id, subject: subject.id_subject }
      });
    },
    openSubjectForm() {
      this.showForm = !this.showForm;
    },
    async loadSubjects() {
      if (!this.user) return this.$router.push('/login');
      try {
        const res = await fetch(
          `http://localhost:8000/api/teacher-dashboard?id_teacher=${this.user.id }`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!res.ok) throw new Error("Error del servidor");

        const data = await res.json();
        this.subjects = data.subjects || [];
        this.getSubjectsMessage = data.message || "";

      } catch (err) {
        console.error("Error al obtenir subjects:", err);
        this.getSubjectsMessage = "No s'han pogut carregar els subjects";
      }
    },
    async deleteSubject(subject) {
      if (!confirm(`Eliminar "${subject.nom_subject}"?`)) return;

      try {
        const res = await fetch("http://localhost:8000/api/teacher-delete-subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_subject: subject.id_subject
          }),
        });

        if (!res.ok) throw new Error("Error eliminant");
        await this.loadSubjects();

      } catch (err) {
        console.error(err);
      }
    }
  }
};

</script>
<template>
  <div class="menu-bar">
    <MenuBar />
  </div>
  <div class="dashboard">
    <div class="subjects-container">
      <div v-for="subject in subjects" :key="subject.id_subject" class="subject-card" @click="goToSubject(subject)">
        <div class="subject-header">
          <h3 class="subject_nom">{{ subject.nom_subject }}</h3>
          <span class="delete-btn" @click.stop="deleteSubject(subject)" title="Eliminar assignatura">
            ✕
          </span>
        </div>
        <div class="subject-body">
          <div class="info-row">
            <span class="label"> </span>
            <span class="value"></span>
          </div>
          <div v-if="subject.descripcio" class="description">
            {{ subject.descripcio }}
          </div>
        </div>
      </div>
      <div class="add-card" @click="openSubjectForm">
        <span class="plus-icon">+</span>
      </div>
    </div>
  </div>

  <div v-if="showForm" class="subject-creation">
    <SubjectCreation :user=user @close="showForm = false" @created="loadSubjects" />
  </div>
</template>

<style scoped>
.menu-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
}

.dashboard {
  padding: 20px;
  padding-top: 64px;
}

.subjects-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 60px;
}

.subject-card {
  width: 100%;
  min-height: 220px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.subject-header {
  position: relative;
  background: #e6f2ef;
  border-bottom: 3px solid #6f9f9a;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  font-size: 1.1rem;
  font-weight: bold;
  color: #6f9f9a;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.subject_nom {
  color: #6f9f9a;
  font-size: 1.25rem;
  margin: 0;
}

.subject-header h4 {
  margin: 2px 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.subject-header h5 {
  margin: 0;
  font-size: 0.75rem;
  color: #555;
}

.add-card {
  width: 100%;
  min-height: 220px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 18px;
  background-color: #f4faf9;
  border: 2px dashed #a2b9b2;
  cursor: pointer;
}

.plus-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;


  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #a2b9b2;
  color: #fff;
  font-size: 2rem;
}

.description {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #555;
  line-height: 1.4;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}
</style>
