<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Detail Checklist</h1>

      <div class="flex mb-4">
        <input v-model="newItem" placeholder="Item baru..." class="input flex-1 mr-2" />
        <button @click="addItem" class="bg-blue-500 text-white px-4 py-2 rounded">Tambah</button>
      </div>

      <ul class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <input type="checkbox" :checked="item.itemCompletionStatus" @change="() => toggleStatus(item)" class="mr-2" />
            <span :class="{ 'line-through text-gray-400': item.itemCompletionStatus }">
              {{ getItemName(item) }}
            </span>
          </div>
          <div class="space-x-2 text-sm">
            <button @click="openEdit(item)" class="text-yellow-500">Edit</button>
            <button @click="confirmDelete(item.id)" class="text-red-500">Hapus</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Edit -->
    <div v-if="editTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 class="text-lg font-semibold mb-4">Edit Item</h2>
        <input v-model="editItemName" class="input mb-4 w-full" />
        <div class="flex justify-end space-x-2">
          <button @click="closeEdit" class="px-4 py-2 rounded bg-gray-300">Batal</button>
          <button @click="saveEdit" class="px-4 py-2 rounded bg-green-500 text-white">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="deleteTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
        <h2 class="text-lg font-semibold mb-4">Yakin ingin menghapus item ini?</h2>
        <div class="flex justify-center space-x-4">
          <button @click="cancelDelete" class="px-4 py-2 rounded bg-gray-300">Batal</button>
          <button @click="deleteItem" class="px-4 py-2 rounded bg-red-500 text-white">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()
const checklistId = route.params.id
const token = localStorage.getItem('token')

const items = ref([])
const newItem = ref('')
const editTarget = ref(null)
const editItemName = ref('')
const deleteTarget = ref(null)

const getItemName = (item) => item.name || item.itemName || 'Tanpa Nama'

const getItems = async () => {
  try {
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${checklistId}/item`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok && data.statusCode === 2000) {
      items.value = data.data
    }
  } catch {
    toast.error('Gagal memuat item')
  }
}

const addItem = async () => {
  if (!newItem.value) return toast.error('Isi dulu nama item-nya!')
  try {
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${checklistId}/item`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemName: newItem.value })
    })
    const data = await res.json()
    if (res.ok && data.statusCode === 2000) {
      toast.success('Item berhasil ditambahkan')
      items.value.push(data.data)
      newItem.value = ''
    } else {
      toast.error(data.message || 'Gagal menambahkan item')
    }
  } catch {
    toast.error('Terjadi kesalahan saat menambah item')
  }
}

const openEdit = (item) => {
  editTarget.value = item
  editItemName.value = getItemName(item)
}

const closeEdit = () => {
  editTarget.value = null
  editItemName.value = ''
}

const saveEdit = async () => {
  try {
    const id = editTarget.value.id
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${checklistId}/item/rename/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemName: editItemName.value })
    })
    const data = await res.json()
    if (res.ok && data.statusCode === 2200) {
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) {
        items.value[index].name = editItemName.value
        items.value[index].itemName = editItemName.value
      }
      toast.success('Item berhasil diubah')
      closeEdit()
    } else {
      toast.error('Gagal menyimpan perubahan')
    }
  } catch {
    toast.error('Kesalahan saat menyimpan perubahan')
  }
}

const confirmDelete = (itemId) => {
  deleteTarget.value = itemId
}

const cancelDelete = () => {
  deleteTarget.value = null
}

const deleteItem = async () => {
  try {
    const id = deleteTarget.value
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${checklistId}/item/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      items.value = items.value.filter(item => item.id !== id)
      toast.success('Item berhasil dihapus')
    } else {
      toast.error('Gagal menghapus item')
    }
  } catch {
    toast.error('Kesalahan saat menghapus item')
  } finally {
    deleteTarget.value = null
  }
}

const toggleStatus = async (item) => {
  try {
    const updated = !item.itemCompletionStatus
    const res = await fetch(`http://94.74.86.174:8080/api/checklist/${checklistId}/item/${item.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemCompletionStatus: updated })
    })
    const data = await res.json()
    if (res.ok && data.statusCode === 2200) {
      item.itemCompletionStatus = updated
      toast.success('Status item diperbarui')
    } else {
      toast.error('Gagal mengubah status item')
    }
  } catch {
    toast.error('Kesalahan saat mengubah status item')
  }
}

onMounted(getItems)
</script>

<style scoped>
.input {
  @apply border border-gray-300 px-3 py-2 rounded;
}
</style>
