<script>
import TeacherEditAssignment from '../teacher_edit_assignmment/TeacherEditAssignment.vue';
import insignia1 from "@/img/insignies/1.png"
import insignia2 from "@/img/insignies/2.png"
import insignia3 from "@/img/insignies/3.png"

export default {
  props: ["user", "subject", "showFormAssignment"],
  components: { TeacherEditAssignment },

  data() {
    return {
      uploadMessage: "",
      assignmentName: "",
      assignmentDescription: "",
      assignmentTasks: 0,
      assignmentDate: "",
      assignmentSessions: 0,
      assignmentId: null,

      assignmentInsignia: 1,
      insignias: [
        { id: 1, src: insignia1},
        { id: 2, src: insignia2 },
        { id: 3, src: insignia3 }
      ]
    };
  }, 
  mounted() {
    if (this.showFormAssignment){
      console.log(this.showFormAssignment)
      this.assignmentName = this.showFormAssignment.nom,
      this.assignmentDescription = this.showFormAssignment.descripcio,
      this.assignmentTasks = this.showFormAssignment.tasques_totals,
      this.assignmentDate = this.showFormAssignment.data_venciment,
      this.assignmentSessions=  this.showFormAssignment.sessions,
      this.assignmentId = this.showFormAssignment.id,
      this.assignmentInsignia = this.showFormAssignment.insignia      

    }
  },
  methods: {
    close() {
      this.$emit("close");
    },

    selectInsignia(id) {
      this.assignmentInsignia = id;
    },

    async addAssignment() {
      if (!(this.assignmentName && this.assignmentDate && this.assignmentInsignia)) {
        this.uploadMessage = "Falten dades";
        return;
      }


      try {
        const body = {
          assignmentName: this.assignmentName,
          assignmentDescription: this.assignmentDescription,
          assignmentTasks: this.assignmentTasks,
          assignmentDate: String(this.assignmentDate),
          assignmentSessions: this.assignmentSessions,
          assignmentInsignia: this.assignmentInsignia,
          id_subject: parseInt(this.subject.id_subject, 10),
          id_assignment: this.assignmentId
      
        };

        const res = await fetch("http://localhost:8000/api/add-assignment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Error del servidor");

        const data = await res.json();
        this.uploadMessage = data.message || "Assignment creat correctament!";
        localStorage.setItem("actualAssignment", JSON.stringify(data.assignment));

        this.close();
        this.$router.push({
          name: "TeacherEditAssignment",
          params: {
            subject: this.subject.id_subject,
            assignment: data.assignment.id
          }
        });

      } catch (err) {
        console.error(err);
        this.uploadMessage = "Error al crear l'Assignment";
      }
    }
  }
};
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h2>Crear Activitats</h2>

      <form @submit.prevent="addAssignment" class="form">

        <div class="field">
          <label>Nom Activitat*</label>
          <input type="text" v-model="assignmentName" required />
        </div>

        <div class="field">
          <label>Data venciment*</label>
          <input type="date" v-model="assignmentDate" required />
        </div>

        <div class="field">
          <label>Descripció</label>
          <input type="text" v-model="assignmentDescription" />
        </div>
        <div class="field">
          <label>Insígnia</label>

          <div class="insignia-selector">
            <img
              v-for="img in insignias"
              :key="img.id"
              :src="img.src"
              class="insignia-option"
              :class="{ selected: assignmentInsignia === img.id }"
              @click="selectInsignia(img.id)"
            />
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn cancel" @click="close">Cancel·lar</button>
          <button type="submit" class="btn primary">Guardar</button>
        </div>

        <p v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #f9f9f9;
  padding: 28px;
  border-radius: 18px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.9rem;
  font-weight: 500;
}

.field input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}

.field input:focus {
  outline: none;
  border-color: #a2b9b2;
  box-shadow: 0 0 0 2px rgba(162, 185, 178, 0.3);
}


.insignia-selector {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.insignia-option {
  width: 70px;
  height: 25px;
  cursor: pointer;
  object-fit: contain;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: transform 0.15s ease, border 0.15s ease;
}

.insignia-option:hover {
  transform: scale(1.1);
}

.insignia-option.selected {
  border: 2px solid #5f9c97;
  background: #eef7f6;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background-color: #a2b9b2;
  color: white;
}

.btn.cancel {
  background-color: transparent;
  color: #666;
}

.upload-message {
  margin-top: 10px;
  text-align: center;
  color: #f97316;
}
</style>
