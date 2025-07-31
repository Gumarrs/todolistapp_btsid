<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded shadow w-full max-w-sm">
      <h1 class="text-xl font-bold mb-4 text-center">Login</h1>
      <input v-model="username" placeholder="Username" class="input mb-2" />
      <input v-model="password" type="password" placeholder="Password" class="input mb-2" />
      <button @click="login" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-medium">
        Masuk
      </button>
      <p class="mt-4 text-sm text-center text-gray-600">
        Belum punya akun?
        <router-link to="/register" class="text-blue-600 hover:underline">Daftar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const username = ref('')
const password = ref('')

const login = async () => {
  if (!username.value || !password.value) {
    toast.warning('Harap isi username dan password.')
    return
  }

  try {
    const res = await fetch('http://94.74.86.174:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await res.json()

    if (res.status === 200 && data.data?.token) {
      localStorage.setItem('token', data.data.token)
      toast.success('Login berhasil! Selamat datang 👋')
      router.push('/checklists')
    } else if (res.status === 401 && data.errorMessage?.toLowerCase().includes('salah')) {
      toast.error('Login gagal: Username atau password salah.')
    } else {
      toast.error(data.errorMessage || 'Login gagal. Silakan coba lagi.')
    }
  } catch (err) {
    toast.error('Terjadi kesalahan saat menghubungi server.')
  }
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 px-3 py-2 rounded w-full;
}
</style>
