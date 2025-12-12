<template>
  <v-card>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="transactions"
        :loading="loading"
        loading-text="Loading transactions..."
        no-data-text="No transactions found"
        class="elevation-1"
        :sort-by="[{ key: 'date', order: 'desc' }]"
      >
        <template v-slot:item.amount="{ item }">
          <span :class="item.type === 'income' ? 'green--text' : 'red--text'">
            {{ item.type === "income" ? "+" : "-" }}Rp{{
              formatRupiah(item.amount)
            }}
          </span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editTransaction(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteTransaction(item.id)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["edit", "delete"]);

// Updated headers for Vuetify 3
const headers = [
  { title: "Date", key: "date", sortable: true },
  { title: "Type", key: "type", sortable: true },
  { title: "Category", key: "category", sortable: true },
  { title: "Description", key: "description", sortable: false },
  { title: "Amount", key: "amount", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

const editTransaction = (transaction) => {
  emit("edit", transaction);
};

const deleteTransaction = (id) => {
  emit("delete", id);
};

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}
</script>

<style scoped>
.green--text {
  color: #4caf50 !important;
}

.red--text {
  color: #f44336 !important;
}
</style>
