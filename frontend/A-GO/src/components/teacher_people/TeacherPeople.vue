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
      searchQuery: "",
      expandedGroups: {},

      hasChanges: false,
      tempSubgroup: null,

      editingSubgroupName: false,
      editedSubgroupName: ""
    };
  },

  mounted() {
    this.loadGroups();
  },

  computed: {
    filteredStudents() {
      if (!this.selectedGroupId) return [];
      return this.groups[this.selectedGroupId].students.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
  ,

  methods: {
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

    startEditSubgroupName() {
      const sg = this.getActiveSubgroup();
      if (!sg) return;

      this.editedSubgroupName = sg.name;
      this.editingSubgroupName = true;
    },

    confirmEditSubgroupName() {
      const sg = this.getActiveSubgroup();
      if (!sg) return;

      sg.name = this.editedSubgroupName;

      this.editingSubgroupName = false;
      if (sg.id) this.updateSubgroupName(sg);
    },

    cancelEditSubgroupName() {
      this.editingSubgroupName = false;
      this.editedSubgroupName = "";
    },

    async updateSubgroupName(subgroup) {
      try {
        const body = {
          id_subgroup: subgroup.id_subgroup,   
          name: subgroup.name
        };

        const res = await fetch("http://localhost:8000/api/update-subgroup-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Error canviant nom");
        this.loadGroups()
      } catch (err) {
        console.error(err)
      }
    },

    async deleteSubgroup(subgroup) {
      try {
        const body = {
          id_subgroup: subgroup.id_subgroup,
        };
        const res = await fetch("http://localhost:8000/api/delete-subgroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Error canviant nom");
        this.loadGroups()
      } catch (err) {
        console.error(err)
      }
    },

    confirmDeleteSubgroup() {
      const sg = this.getActiveSubgroup();
      if (!sg) return;

      const ok = confirm(`Segur que vols eliminar el subgrup "${sg.name}"?`);
      if (!ok) return;

      this.deleteSubgroup(sg);
    },

    getActiveSubgroup() {
      if (this.selectedSubgroupId === "temp") return this.tempSubgroup;

      if (!this.selectedGroupId || !this.selectedSubgroupId) return null;
      return this.groups[this.selectedGroupId].subgroups[this.selectedSubgroupId];
    },

    toggleGroup(id) {
      this.expandedGroups = { [id]: !this.expandedGroups[id] };
      this.selectedGroupId = id;
      this.selectedSubgroupId = null;
      this.tempSubgroup = null;
    },

    selectSubgroup(id) {
      this.selectedSubgroupId = id;
      this.tempSubgroup = null;
    },

    async populateSubgroup() {
      const sg = this.getActiveSubgroup();

      if (!sg || !sg.students || !sg.name || !sg.id_group) return;

      try {
        const res = await fetch("http://localhost:8000/api/create-subgroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sg)
        });

        const data = await res.json();
        this.loadGroups()
        this.selectedSubgroupId = data.id_subgroup;
        this.tempSubgroup = null;
        this.hasChanges = false;

      } catch (err) {
        console.error("Error creant subgrup", err);
      }
    },

    createSubgroup(groupId) {
      const group = this.groups[groupId];

      const nextLetter =
        String.fromCharCode(65 + Object.keys(group.subgroups).length);

      this.tempSubgroup = {
        id_subgroup: null,
        id_group: groupId,
        name: `Subgrup ${nextLetter}`,
        students: []
      };

      this.selectedSubgroupId = "temp";
    },

    toggleStudentInSubgroup(student) {

      const sg = this.getActiveSubgroup();
      if (!sg) return;

      const index = sg.students.findIndex(s => s.id_student === student.id_student);

      if (index !== -1) {
        sg.students.splice(index, 1);
      } else {
        sg.students.push(student);
      }

      this.hasChanges = true;
    },

    isStudentInSubgroup(student) {
      const sg = this.getActiveSubgroup();
      if (!sg) return false;
      return sg.students.some(s => s.id_student === student.id_student);
    },

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
            <div class="grup-title">
              {{ group.name }}
            </div>
          </div>

          <div class="subgrups-container" v-if="expandedGroups[id_group]">
            <div class="subgrups-list">
              <div v-for="(subgroup, id_subgroup) in group.subgroups" :key="id_subgroup" class="subgrup-item"
                @click.stop="selectSubgroup(id_subgroup)" :class="{ selected: selectedSubgroupId === id_subgroup }">

                {{ subgroup.name }}
              </div>

              <div v-if="tempSubgroup && tempSubgroup.id_group === id_group" class="subgrup-item selected">
                {{ tempSubgroup.name }} (nou)
              </div>

              <div class="add-subgrup" @click.stop="createSubgroup(id_group)">
                + Afegir subgrup
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <section class="right-panel" v-if="selectedGroupId">
      <div class="students-card">
        <div v-if="getActiveSubgroup()" class="subgroup-title">

          <h1 v-if="!editingSubgroupName" class="subgroup-header">
            {{ getActiveSubgroup().name }}

            <span class="edit-icon" @click="startEditSubgroupName">✏️</span>
            <span class="delete-icon" @click="confirmDeleteSubgroup">🗑</span>
          </h1>


          <div v-else class="edit-subgroup">
            <input v-model="editedSubgroupName" @keyup.enter="confirmEditSubgroupName"
              @keyup.esc="cancelEditSubgroupName" class="edit-input" />
            <button @click="confirmEditSubgroupName">✔</button>
            <button @click="cancelEditSubgroupName">✖</button>
          </div>

        </div>
        <h3>Estudiants Disponibles</h3>

        <input type="text" v-model="searchQuery" placeholder="Cerca estudiant..." class="search-bar" />

        <p class="description">*Estudiants apuntats al grup</p>

        <div class="students-list">
          <div v-for="student in filteredStudents" :key="student.id" class="student-item">
            <div class="student-checkbox">
              <input type="checkbox" :checked="isStudentInSubgroup(student)" @change="toggleStudentInSubgroup(student)"
                :disabled="!selectedSubgroupId" />
            </div>
            <div class="student-name">{{ student.name }}</div>
          </div>
          <button class="accept-button" :disabled="!hasChanges || !getActiveSubgroup()" @click="populateSubgroup()">
            Acceptar
          </button>
        </div>
      </div>
    </section>

    <section class="right-panel" v-else>
      <div class="students-card empty-state">
        <h2>Estudiants Disponibles</h2>
        <p>Selecciona un grup per veure els estudiants disponibles</p>
      </div>
    </section>
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

.layout {
  margin-top: 135px;
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 32px;
  padding: 32px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 130px);
}

.groups-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.accept-button {
  margin-top: 24px;
  padding: 14px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background-color: #5f9c97;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accept-button:hover:not(:disabled) {
  background-color: #4a8681;
}

.accept-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.groups-section h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

.grup-card {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.grup-header {
  padding: 16px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid transparent;
}

.grup-header:hover {
  background-color: #f0f0f0;
}

.grup-title {
  font-weight: 600;
  font-size: 18px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  font-size: 12px;
  transition: transform 0.3s;
  color: #666;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.subgrups-container {
  padding: 16px;
  background-color: #fefefe;
  border-top: 1px solid #e0e0e0;
}

.subgrups-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subgrup-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
}

.subgrup-item:hover {
  background-color: #f8f8f8;
}

.subgrup-item.selected {
  background-color: f8f8f8;
  ;
  border-color: #5f9c97;
}

.subgrup-checkbox {
  margin-right: 12px;
}

.add-subgrup {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #f0f0f0;
  color: #5f9c97;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  border: 1px dashed #ccc;
  transition: background-color 0.2s;
}

.add-subgrup:hover {
  background-color: #e8e8e8;
  border-color: #5f9c97;
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.students-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.students-card.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.students-card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.search-bar {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  box-sizing: border-box;
}

.description {
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
  font-style: italic;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
}

.student-item:hover {
  background-color: #f5f5f5;
}

.student-checkbox {
  margin-right: 16px;
}

.student-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.student-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.student-name {
  font-size: 16px;
  color: #333;
  font-family: 'Courier New', monospace;
}
.subgroup-title {
  display: flex;
  align-items: center;
}

.subgroup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-size: 24px;
  margin: 0;
}

.edit-icon {
  cursor: pointer;
  font-size: 14px;
}

.delete-icon {
  margin-left: auto;
  cursor: pointer;
  font-size: 14px;
  color: #c0392b;
}

.edit-subgroup {
  display: flex;
  gap: 8px;
}

.edit-input {
  padding: 6px 8px;
  font-size: 14px;
}

</style>
