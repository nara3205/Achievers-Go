<script>
export default {
  props: ["user"],

  data() {
    return {
      selectedFile: null,
      uploadMessage: "",
      subjectName: "",
      subjectDescription: ""
    };
  },

  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },

    close() {
      this.$emit("close");
    },

    async addSubject() {
      if (!(this.selectedFile && this.subjectName && this.user?.id)) {
        this.uploadMessage = "Falten dades";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("subjectName", this.subjectName);
        formData.append("subjectDescription", this.subjectDescription);
        formData.append("file", this.selectedFile);
        formData.append("id_teacher", this.user.id);

        const res = await fetch("http://localhost:8000/api/add-subject", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Error del servidor");

        const data = await res.json();
        this.uploadMessage = data.message || "Assignatura creada!";
        this.close(); 
        this.$emit("created");
      } catch (err) {
        console.error(err);
        this.uploadMessage = "Error en pujar el fitxer";
      }
    }
  }
};

</script>

<template>

  
<div class="modal-backdrop" @click.self="close">
  <div class="modal">
    <h2>Crear assignatura</h2>

    <form @submit.prevent="addSubject" class="form">
      <div class="field">
        <label>Nom Assignatura*</label>
        <input type="text" v-model="subjectName" required />
      </div>

      <div class="field">
        <label>Descripció</label>
        <input type="text" v-model="subjectDescription" />
      </div>

      <div class="field">
        <label>CSV d'alumnes</label>
        <input type="file" accept=".csv" @change="handleFileUpload" required />
      </div>

      <div class="actions">
        <button type="button" class="btn cancel" @click="close">Cancel·lar</button>
        <button type="submit" class="btn primary">Crear</button>
      </div>
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

  z-index: 999;
}

.modal {
  background: white;
  padding: 28px;
  border-radius: 18px;
  width: 420px;
  max-width: 90%;
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
  color: #333;
}

.field input[type="text"],
.field input[type="file"] {
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

.btn.primary:hover {
  background-color: #8fa9a2;
}

.btn.cancel {
  background-color: transparent;
  color: #666;
}

.btn.cancel:hover {
  color: #000;
}


</style>
