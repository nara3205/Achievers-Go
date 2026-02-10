<script>
export default {
  data() {
    return {
      email_niu: "",
      password: "",
      loginMessage: "",
    };
  },

  methods: {
    async login() {
      try {
        const res = await fetch("http://localhost:8000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_niu: this.email_niu,
            password: this.password,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Error en la resposta del servidor");
        }

        const data = await res.json();

        if (data.logged && data.user) {
          const savedUser = {
            id: data.user.id,
            tipus: data.user.tipus,
            email_niu: data.user.email_niu ?? data.user.email
          };
          localStorage.setItem("loggedUser", JSON.stringify(savedUser));

          if (savedUser.tipus === "teacher" || savedUser.tipus === "teacher") {

            return this.$router.push({ name: 'TeacherDashboard', params: { id: String(savedUser.id) } });
          } else {
            return this.$router.push({ name: 'StudentDashboard', params: { id: String(savedUser.id) } });
          }
        }

        this.loginMessage = data.message || "Credencials incorrectes";
      } catch (err) {
        console.error("Error al fer login:", err);
        this.loginMessage = err.message || "Error al iniciar sessió";
      }
    },
  },
};
</script>




<template>
  <div>
    <h2>Inicia sessió</h2>

    <form @submit.prevent="login">
      <div>
        <label for="email_niu">Email:</label>
        <input type="text" id="email_niu" v-model="email_niu" required />
      </div>

      <div>
        <label for="password">Contrasenya:</label>
        <input type="password" id="password" v-model="password" required />
      </div>

      <button type="submit">Inicia sessió</button>
    </form>

    <p v-if="loginMessage">{{ loginMessage }}</p>
  </div>
</template>

<style scoped>
form {
  margin-top: 20px;
}

form div {
  margin-bottom: 10px;
}

label {
  display: block;
  font-weight: bold;
}

input {
  padding: 5px;
  width: 200px;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
