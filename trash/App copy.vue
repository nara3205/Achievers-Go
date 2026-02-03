<script>
export default {
  data() {
    return {
      message: 'Carregant...'
      db: 'Carregant...'
    }
  },
  mounted() {
    fetch('http://localhost:8000/api/message')
      .then(res => res.json())
      .then(data => {
        this.message = data.message
      })
      .catch(err => {
        console.error('Error al cridar el backend:', err)
        this.message = 'Error al carregar el missatge'
      })
    fetch('http://localhost:8000/api/db')
      .then(res => res.json())
      .then(data => {
        this.db = data
      })
      .catch(err => console.error(err))
  }
}
</script>

<template>
  <div>
    <h1>Frontend Vue</h1>
    <p>Missatge del backend: {{ message }}</p>
    <p>Missatge del backend sobre la db: {{ db }}</p>
  </div>
</template>
