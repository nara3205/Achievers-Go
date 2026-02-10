<script>
import logo from "@/img/logo.png"

export default {
    props: ["show_clear_bar", "subjectText", "assignmentText", "avatar"],
    data() {
        return {
            logo,
            user: JSON.parse(localStorage.getItem("loggedUser")) || null,
            subject: JSON.parse(localStorage.getItem("actualSubject")) || null,
            showMenu: false
        }
    },
    computed: {
        activeTab() {
            const routeName = this.$route.name;
            if (routeName === "StudentSubjectsDashboard") return "tauler";
            if (routeName === "StudentPeople") return "people";
            return "assignments";
        }
    },

    methods: {

        goToSubject() {
            this.$router.push({
                name: "StudentSubjectsDashboard",
                params: { id: this.user.id, subject: this.subject.id_subject }
            });
        },
        goHome() {
            this.$router.push({
                name: "StudentDashboard",
                params: { id: this.user.id }
            });
        },
        goPeople() {
            this.$router.push({
                name: "StudentPeople",
                params: { id: this.user.id, subject: this.subject.id_subject }
            });
        },
        goSettings() {
            this.$router.push({
                name: "StudentSettings",
                params: { id: this.user.id, subject: this.subject.id_subject }
            });
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
        },

        editAvatar() {
            this.showMenu = false;
            this.goSettings(); 
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
        <div v-if="avatar" class="right">
            <img class="avatar" :src="avatar || '/src/img/avatars/1.jpeg'" alt="Avatar" />
            <span class="plus" @click="toggleMenu()">⚙</span>

            <div v-if="showMenu" class="dropdown">
                <div class="dropdown-item" @click="editAvatar">
                ✎ Editar avatar
                </div>
                <div class="dropdown-item" @click="logout">
                ➜] Tancar sessió
                </div>
            </div>
        </div>
        <div v-else class="right">
            <span class="plus" @click="toggleMenu()">⚙</span>
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
            <span class="assignments" :class="{ bold: activeTab === 'tauler' }" @click="goToSubject">
                Tauler
            </span>
            <span class="people" :class="{ bold: activeTab === 'people' }" @click="goPeople">
                Persones
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
    color: rgb(64, 95, 90);
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

.right {
    position: relative;
    display: flex;
    align-items: center;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.plus {
    position: absolute;
    bottom: -8px;
    right: -8px;
    border-radius: 50%;
    font-size: 20px;
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
.dropdown {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border-radius: 12px;
  min-width: 180px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
  overflow: hidden;
  z-index: 2000;
}
.dropdown-item {
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
}
.bold {
    font-weight: bold;
}
</style>
