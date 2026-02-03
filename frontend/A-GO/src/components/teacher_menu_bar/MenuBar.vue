<script>
import avatar1 from "@/img/avatars/0.jpeg"
import logo from "@/img/logo.png"

export default {
    props: ["show_clear_bar", "subjectText", "assignmentText"],
    data() {
        return {
            avatar1,
            logo,
            user: JSON.parse(localStorage.getItem("loggedUser")) || null,
            subject: JSON.parse(localStorage.getItem("actualSubject")) || null,
            showMenu: false
        }
    },
    computed: {
        activeTab() {
            const routeName = this.$route.name;
            if (routeName === "TeacherPeople") return "people";
            if (routeName === "TeacherEvaluation") return "evaluation";
            return "assignments"; 
        }
    },

    methods: {
        goToSubject() {
            this.$router.push({
                name: "TeacherSubjectsDashboard",
                params: { id: this.user.id, subject: this.subject.id_subject }
            });
        },
        goHome() {
            this.$router.push({
                name: "TeacherDashboard",
                params: { id: this.user.id }
            });
        },
        goPeople() {
            this.$router.push({
                name: "TeacherPeople",
                params: { id: this.user.id, subject: this.subject.id_subject }
            });
        },
        goToevaluation() {
            this.$router.push({
                name: "TeacherEvaluation",
                params: { subject: this.subject.id_subject }
            });
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
        },
        logout() {
            localStorage.setItem("loggedUser", null);
            localStorage.setItem("actualSubject", null);
            localStorage.setItem("actualAssignment", null)
            this.showMenu = false;

            this.$router.push({ name: "Login" });

        }
    }

}
</script>

<template>
    <header class="topbar">
        <div class="left">
            <img class="logo" @click="goHome()" :src="logo" alt="Logo" />
        </div>
        <div class="right">
            <img class="avatar" :src="avatar1" alt="Avatar" />
            <span class="plus"  @click="toggleMenu()" >⚙</span>

            <div v-if="showMenu" class="dropdown">
                <div class="dropdown-item" @click="logout">
                ➜] Tancar sessió
                </div>
            </div>
        </div>
    </header>

    <div v-if="show_clear_bar" class="clear-bar">
        <div class="left-area" @click="goToSubject">
            <span class="subject-text">{{ subjectText }}{{ assignmentText }}</span>
        </div>

        <div class="center-area">
            <span class="assignments" :class="{ bold: activeTab === 'assignments' }" @click="goToSubject">
                Assignments
            </span>
            <span class="people" :class="{ bold: activeTab === 'people' }" @click="goPeople">
                Persones
            </span>
            <span class="evaluation" :class="{ bold: activeTab === 'evaluation' }" @click="goToevaluation">
                Avaluació
            </span>
        </div>
    </div>
</template>

<style>
.clear-bar {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    height: 50px;
    background-color: rgba(143, 191, 184, 0.49);
    display: grid;
    grid-template-columns: 300px 1fr 150px; 
    align-items: center;
    padding: 0 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 900;
}

.left-area {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}

.subject-text {
    font-size: 18px;
    color:  rgb(64, 95, 90);
}

.center-area {
    display: flex;
    justify-content: center;
    gap: 20px;
    transform: translateX(-60px); 
}
.people,
.assignments,
.evaluation {
    font-size: 20px;
    cursor: pointer;
    color: black;
}

.right-area {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.plus {
    font-size: 26px;
    color: black;
    cursor: pointer;
}
.topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    height: 80px;
    background-color: #6f9f9a;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);

    z-index: 1000;
}

.left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.logo {
    font-family: 'Acme', sans-serif;
    font-size: 34px;
    color: white;
    letter-spacing: 2px;
    cursor: pointer;
}

.logout-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 6px;
}

.bold {
    font-weight: bold;
}
</style>
