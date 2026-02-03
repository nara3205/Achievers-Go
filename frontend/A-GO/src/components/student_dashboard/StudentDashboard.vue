<script>
import MenuBar from "../student_menu_bar/MenuBar.vue"

export default {
  components: { MenuBar },

  data() {
    return {
      subjects: [],
      getSubjectsMessage: "",
      user: JSON.parse(localStorage.getItem("loggedUser")) || null,
    };
  },

  methods: {
    goToSubject(subject) {
      localStorage.setItem('actualSubject', JSON.stringify(subject))
      this.$router.push({
        name: "StudentSubjectsDashboard",
        params: { id: this.user.id, subject: subject.id_subject }
      });
    },
    openSubjectForm() {
      this.showForm = !this.showForm;
    },
    async loadSubjects() {
      if (!this.user) return this.$router.push('/login');
      try {
        const res = await fetch("http://localhost:8000/api/student-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_student: this.user.id }),
        });

        if (!res.ok) throw new Error("Error del servidor");

        const data = await res.json();
        this.subjects = data.subjects || [];
        this.getSubjectsMessage = data.message || "";
      } catch (err) {
        console.error("Error al obtenir subjects:", err);
        this.getSubjectsMessage = "No s'han pogut carregar els subjects";
      }
    }
  },
  async mounted() {
    this.loadSubjects()
  }
};

</script>

<template>
  <div class="menu-bar">
    <MenuBar :avatar="null" />
  </div>

  <div class="dashboard">
    <div class="subjects-container">

      <div v-for="subject in subjects" :key="subject.id_subject" class="subject-card" @click="goToSubject(subject)">
        <div class="subject-header">
          <div class="header-left">
            <h3 class="subject_nom">{{ subject.nom_subject }}</h3>
          </div>

          <div class="avatar">
            <img :src="subject.avatar" alt="avatar" />
          </div>
        </div>
        <div class="subject-body">
          <div class="info-row">
            <span class="label">Subgrup: </span>
            <span class="value">{{ subject.nom_subgrup }}</span>
          </div>

          <div class="info-row">
            <span class="label">Grup:  </span>
            <span class="value">{{ subject.nom_grup }}</span>
          </div>

          <div v-if="subject.descripcio" class="description">
            {{ subject.descripcio }}
          </div>
        </div>


      </div>
    </div>
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
  padding: 50px;
  padding-top: 110px;
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
  background: #e6f2ef;
  border-bottom: 3px solid #6f9f9a;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: white;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.subject-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
}

.info-row {
  display: flex;
  align-items: center;
}

.label {
  font-size: 0.95rem;
  color: #6f9f9a;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  margin-left: 10px;
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
