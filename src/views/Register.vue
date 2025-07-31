<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded shadow w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-4 text-center">Register</h1>

      <input
        v-model="email"
        placeholder="Email"
        type="email"
        class="input mb-2"
      />
      <input
        v-model="username"
        placeholder="Username"
        class="input mb-2"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input mb-2"
      />

      <button
        @click="register"
        class="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full font-medium"
      >
        Daftar
      </button>

      <p class="mt-4 text-sm text-center text-gray-600">
        Sudah punya akun?
        <router-link to="/login" class="text-blue-600 hover:underline">Login</router-link>
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

const email = ref('')
const username = ref('')
const password = ref('')

const isEmailValid = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

const resetForm = () => {
  email.value = ''
  username.value = ''
  password.value = ''
}

const register = async () => {
  if (!email.value || !username.value || !password.value) {
    toast.warning('Semua kolom wajib diisi!')
    return
  }

  if (!isEmailValid(email.value)) {
    toast.error('Format email tidak valid!')
    return
  }

  try {
    const res = await fetch('http://94.74.86.174:8080/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (data.message === 'success') {
      toast.success('Akun berhasil dibuat. Silakan login.')
      resetForm()
      setTimeout(() => router.push('/login'), 1000)
    } else if (
      data.message === 'Validation Error' &&
      data.errorMessage?.toLowerCase().includes('terdaftar')
    ) {
      toast.info('Akun sudah terdaftar. Silakan login.')
      resetForm()
      setTimeout(() => router.push('/login'), 1500)
    } else {
      toast.error(data.errorMessage || data.message || 'Registrasi gagal.')
    }
  } catch (error) {
    toast.error('Terjadi kesalahan saat menghubungi server.')
  }
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 px-3 py-2 rounded w-full;
}
</style>
