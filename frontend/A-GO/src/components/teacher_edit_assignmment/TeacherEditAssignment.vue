<script>
import MenuBar from "../teacher_menu_bar/MenuBar.vue";

export default {
    components: { MenuBar },

    data() {
        return {
            tasks: [],
            user: JSON.parse(localStorage.getItem("loggedUser")) || null,
            assignment: JSON.parse(localStorage.getItem("actualAssignment")) || null,
            subject: JSON.parse(localStorage.getItem("actualSubject")) || null
        };
    },

    mounted() {
        this.loadTasks();
    },

    methods: {
        async loadTasks() {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/teacher-edit-assignment?id_assignment=${this.assignment.id}`
                );
                if (!res.ok) throw new Error();
                const data = await res.json();
                this.tasks = data.tasks
                if (this.tasks.length === 0) {
                    this.tasks.push({
                        id: "new",
                        nom: "",
                        data_venciment: "",
                        punts: null,
                        descripcio: "",
                        isEditing: true
                    });
                }
            } catch (err) {
                console.error("Error carregant tasques", err);
            }
        },

        openSubjectForm() {
            if (this.tasks.some(t => t.isEditing)) return;

            this.tasks.push({
                id: "new",
                nom: "",
                data_venciment: "",
                punts: 0,
                descripcio: "",
                isEditing: true
            });
        },

        editTask(task) {
            if (this.tasks.some(t => t.isEditing)) return;
            task.isEditing = true;
        },

        goToSubject() {
            this.$router.push({
                name: "TeacherSubjectsDashboard",
                params: { id: this.user.id, subject: this.subject.id }
            });
        },

        async handleSave(task) {
            if (task.id === "new") {
                await this.saveTask(task);
            } else {
                await this.updateTask(task);
            }
        },

        async saveTask(task) {
            if (!(task.nom && task.data_venciment && task.punts)) {
                alert("Falten dades obligatòries");
                return;
            }

            try {
                const body = {
                    nom: task.nom,
                    data_venciment: task.data_venciment,
                    punts: task.punts,
                    descripcio: task.descripcio || "",
                    id_assignment: parseInt(this.assignment.id, 10)
                };

                const res = await fetch("http://localhost:8000/api/add-task", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error();

                const data = await res.json();

                task.id = data.id ?? Date.now();
                task.isEditing = false;

            } catch (err) {
                console.error("Error creant tasca", err);
                alert("Error creant la tasca");
            }
        },

        async updateTask(task) {
            try {
                const body = {
                    nom: task.nom,
                    data_venciment: task.data_venciment,
                    punts: task.punts,
                    descripcio: task.descripcio,
                    id_assignment: parseInt(this.assignment.id, 10),
                    task_id: task.id

                };

                const res = await fetch(
                    `http://localhost:8000/api/update-task`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    }
                );

                if (!res.ok) throw new Error();

                task.isEditing = false;


            } catch (err) {
                console.error("Error actualitzant tasca", err);
                alert("Error actualitzant la tasca");
            }
        },

        async cancelTask(task) {
            task.isEditing = false
        },

        async removeTask(task) {
            if (!confirm("Segur que vols eliminar aquesta tasca?")) return;

            try {
                const body = {
                    task_id: task.id
                };

                const res = await fetch(
                    "http://localhost:8000/api/delete-task",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    }
                );

                if (!res.ok) throw new Error();
                this.tasks = this.tasks.filter(t => t !== task);

            } catch (err) {
                console.error("Error eliminant tasca", err);
                alert("Error eliminant la tasca");
            }
        }

    }
};
</script>

<template>
    <div class="menu-bar">
        <MenuBar :show_clear_bar="true" :subject-text="subject.nom_subject" :assignment-text="`/${assignment.nom}`" />
    </div>

    <div class="page-header">
        <h1>Creació i edició de tasques ✏️ </h1>
    </div>


    <div class="tasques">
        <div v-for="task in tasks" :key="task.id" class="task-card">
            <div v-if="task.isEditing">
                <div class="task-header">
                    <input class="input-title" placeholder="Nom de la tasca" v-model="task.nom" />

                    <input type="date" class="input-date" v-model="task.data_venciment" />
                </div>

                <div class="task-body">
                    <textarea class="input-desc" placeholder="Descripció" v-model="task.descripcio"></textarea>

                    <input type="number" class="input-points" placeholder="Punts" v-model.number="task.punts" min="0" />

                    <div class="task-actions">
                        <button @click="handleSave(task)">Guardar</button>
                        <button class="cancel" @click="cancelTask(task)">Cancel·la</button>
                    </div>
                </div>
            </div>
            <div v-else @click="editTask(task)">
                <div class="task-header">
                    <div class="task-title">📄 {{ task.nom }}</div>
                    <div class="task-deadline">
                        Data límit per obtenir punts: {{ task.data_venciment }}
                    </div>
                    <button class="delete-task" @click.stop="removeTask(task)" title="Eliminar tasca">
                        ✖
                    </button>
                </div>
                <div class="task-body">
                    <p class="task-points">Punts: {{ task.punts }}</p>
                    <div class="task-description">Descripció: {{ task.descripcio }}</div>
                </div>
            </div>

        </div>

        <button class="fab" @click="openSubjectForm">+</button>

        <button class="finalitza" @click="goToSubject">Finalitza</button>
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

.tasques {
    margin-top: 10px;
    padding: 32px;
}

.task-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.task-header {
    display: flex;
    gap: 16px;
    justify-content: space-between;
}

.task-title {
    font-size: 18px;
    font-weight: 600;
}

.task-deadline {
    font-size: 14px;
    color: #5f9c97;
    align-items: left;
}

.task-menu {
    font-size: 22px;
    cursor: pointer;
}
.task-body {
    margin-top: 16px;
}

.task-points {
    color: #5f9c97;
    font-weight: 500;
}

.task-description {
    margin-top: 8px;
    height: 6px;
    color: #777373;
}
.input-title,
.input-date,
.input-points,
.input-desc {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 8px;
}

.input-desc {
    resize: none;
    height: 60px;
}

.task-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
}

.task-actions button {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

.task-actions .cancel {
    background: #e0e0e0;
}

.delete-task {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
}

.delete-task:hover {
    color: #e74c3c;
}

.fab {
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

.finalitza {
    color: white;
    position: fixed;
    bottom: 40px;
    right: 40px;
    background: #9bbdb9;
    border: none;
    padding: 16px 32px;
    border-radius: 999px;
    font-size: 18px;
    cursor: pointer;
}

.page-header {
    margin-top: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.page-header h1 {
    font-size: 30px;
    font-weight: 700;
    color: #2c3e50;
    background: #f4f8f7;
    padding: 14px 28px;
    border-radius: 999px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.page-header p {
    font-size: 14px;
    color: #5f9c97;
}
</style>
