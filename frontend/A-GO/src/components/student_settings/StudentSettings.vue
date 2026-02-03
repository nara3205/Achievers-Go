<script>
import MenuBar from "../student_menu_bar/MenuBar.vue";

export default {
  components: { MenuBar },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("loggedUser")),
      subject: JSON.parse(localStorage.getItem("actualSubject")),
      avatars: {},
      selectedAvatar: null
    };
  },

  mounted() {
    this.loadAvatars();
  },

  methods: {
    loadAvatars() {
      this.selectedAvatar = this.subject.avatar
      this.avatars = [
        "/src/img/avatars/1.jpeg",
        "/src/img/avatars/2.jpeg",
        "/src/img/avatars/3.jpeg",
        "/src/img/avatars/4.jpeg",
        "/src/img/avatars/5.jpeg",
        "/src/img/avatars/6.jpeg",
        "/src/img/avatars/7.jpeg",
        "/src/img/avatars/8.jpeg",
        "/src/img/avatars/9.jpeg",
        "/src/img/avatars/10.jpeg"
      ]
        ;
    },

    async changeAvatar(avatar_url) {
      try {
        this.selectedAvatar = avatar_url

        const res = await fetch("http://localhost:8000/api/student-edit-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({id_subgrup: this.subject.id_subgrup, avatar_url: avatar_url }),
        });
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();

        this.subject.avatar = avatar_url
        localStorage.setItem('actualSubject', JSON.stringify(this.subject))
      } catch (err) {
        console.error("Error al modificar avatar:", err);
      }
    }
  }

};
</script>

<template>
  <div class="menu-bar">
    <MenuBar :show_clear_bar="true" :avatar="subject.avatar" />
  </div>

  <div class="page-container">
    <div class="card">
      <div class="avatar-preview">
        <div class="avatar-circle">
          <img :src="subject.avatar" alt="user avatar" />
        </div>
        <p class="subgroup-name">{{ subject.nom_subgrup }}</p>
        <p class="group-name">{{ subject.nom_grup }}</p>
        <p class="subtitle">Selecciona el teu avatar</p>
      </div>

      <div class="avatars-grid">
        <div
          v-for="avatar in avatars"
          :key="avatar"
          class="avatar-item"
          :class="{ active: selectedAvatar === avatar }"
          @click="changeAvatar(avatar)"
        >
          <img :src="avatar" alt="avatar" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>

.page-container {
  display: flex;
  justify-content: center;
  padding: 150px 40px;
}
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 40px 50px;
  width: 520px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.12);
}
.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #f5f7f8;
  box-shadow: inset 0px 2px 6px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-circle img {
  width: 135px;
  height: 135px;
  border-radius: 50%;
  object-fit: cover;
}
.subgroup-name {
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 22px;
  font-weight: 600;
}
.group-name {
  margin-top: 5px;
  font-size: 15px;
  color: #6fa6a1;
}

.subtitle {
  font-size: 14px;
  color: #666;
}
.avatars-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
  margin-top: 10px;
}
.avatar-item {
  background: #fafafa;
  border-radius: 50%;
  cursor: pointer;
  aspect-ratio: 1;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid transparent;
}
.avatar-item img {
  width: 70%;
  height: 70%;
  border-radius: 50%;
}
.avatar-item:hover {
  transform: scale(1.08);
  box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
}
.avatar-item.active {
  border: 3px solid #6fa6a1;
  transform: scale(1.05);
}
</style>