<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Checklist Saya</h1>
        <button @click="logout" class="text-sm text-red-500">Logout</button>
      </div>

      <!-- Tambah Checklist -->
      <div class="flex flex-wrap gap-2 mb-6">
        <input v-model="newChecklist" placeholder="Checklist baru..." class="input flex-1 min-w-0" />

        <select v-model="selectedColor" class="input w-32">
          <option value="blue">Biru</option>
          <option value="green">Hijau</option>
          <option value="red">Merah</option>
          <option value="yellow">Kuning</option>
          <option value="purple">Ungu</option>
        </select>

        <button @click="addChecklist" class="bg-blue-500 text-white px-4 py-2 rounded">Tambah</button>
      </div>

      <!-- Daftar Checklist -->
      <div v-if="checklists.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="checklist in checklists"
          :key="checklist.id"
          class="p-4 rounded shadow"
          :class="`bg-${checklist.color || 'white'}-100 border-t-4 border-${checklist.color || 'gray'}-400`"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-lg">{{ checklist.name }}</h2>
            <button @click="deleteChecklist(checklist.id)" class="text-red-500 text-sm">Hapus</button>
          </div>

          <!-- Daftar Item Checklist (max 3) -->
          <ul class="text-sm space-y-1 mb-2">
            <li v-for="item in checklist.items.slice(0, 3)" :key="item.id" class="flex items-center">
              <input type="checkbox" :checked="item.itemCompletionStatus" class="mr-2" disabled />
              <span :class="{ 'line-through text-gray-400': item.itemCompletionStatus }">
                {{ item.name || item.itemName }}
              </span>
            </li>
          </ul>

          <!-- Link ke detail -->
          <router-link :to="`/checklists/${checklist.id}`" class="text-blue-600 hover:underline text-sm">
            Lihat Detail
          </router-link>
        </div>
      </div>
      <p v-else class="text-gray-500 text-center mt-8">Belum ada checklist</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const token = localStorage.getItem('token')
const checklists = ref([])
const newChecklist = ref('')
const selectedColor = ref('blue')

if (!token) router.push('/login')

onMounted(() => {
  getChecklists()
})

const getChecklists = async () => {
  try {
    const res = await fetch('http://94.74.86.174:8080/api/checklist', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    checklists.value = data.data || []

    // Fetch item untuk masing-masing checklist
    for (const checklist of checklists.value) {
      const itemRes = await fetch(`http://94.74.86.174:8080/api/checklist/${checklist.id}/item`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const itemData = await itemRes.json()
      checklist.items = itemData.data || []
    }
  } catch (err) {
    toast.error('Gagal memuat checklist')
  }
}

const addChecklist = async () => {
  if (!newChecklist.value.trim()) return toast.warning('Nama checklist tidak boleh kosong')

  try {
    const res = await fetch('http://94.74.86.174:8080/api/checklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newChecklist.value.trim(), color: selectedColor.value })
    })

    const data = await res.json()
    if (res.ok && (data.statusCode === 2000 || data.statusCode === 201)) {
      toast.success('Checklist berhasil ditambahkan')
      newChecklist.value = ''
      selectedColor.value = 'blue'
      await getChecklists()
    } else {
      toast.error(data.message || 'Gagal menambahkan checklist')
    }
  } catch {
    toast.error('Terjadi kesalahan saat menambah checklist')
  }
}

const deleteChecklist = async (id) => {
  try {
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      toast.success('Checklist berhasil dihapus')
      await getChecklists()
    } else {
      toast.error('Gagal menghapus checklist. Pastikan tidak ada item di dalamnya.')
    }
  } catch {
    toast.error('Terjadi kesalahan saat menghapus checklist')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 px-3 py-2 rounded;
}
</style>
