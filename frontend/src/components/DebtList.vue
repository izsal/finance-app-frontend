<template>
  <v-card>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="debts"
        :loading="loading"
        loading-text="Loading debts..."
        no-data-text="No debts found"
        class="elevation-1"
        :sort-by="[{ key: 'date', order: 'desc' }]"
      >
        <template v-slot:item.amount="{ item }">
          <span :class="item.type === 'owed' ? 'green--text' : 'red--text'">
            {{ item.type === "owed" ? "+" : "-" }}Rp{{
              formatRupiah(item.amount)
            }}
          </span>
        </template>

        <template v-slot:item.remaining="{ item }">
          <span :class="item.type === 'owed' ? 'green--text' : 'red--text'">
            {{ item.type === "owed" ? "+" : "-" }}Rp{{
              formatRupiah(item.remaining)
            }}
          </span>
        </template>

        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" dark small>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.dueDate="{ item }">
          <span v-if="getDueDate(item)">
            {{ formatDate(getDueDate(item)) }}
          </span>
          <span v-else class="grey--text text--lighten-1">-</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="makePayment(item)">
            mdi-cash
          </v-icon>
          <v-icon small class="mr-2" @click="editDebt(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteDebt(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  debts: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["edit", "delete", "makePayment"]);

const headers = [
  { title: "Type", key: "type", sortable: true },
  { title: "Name", key: "name", sortable: true },
  { title: "Description", key: "description", sortable: true },
  { title: "Amount", key: "amount", sortable: true },
  { title: "Remaining", key: "remaining", sortable: true },
  { title: "Date", key: "date", sortable: true },
  { title: "Due Date", key: "dueDate", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

const getStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "green";
    case "partial":
      return "orange";
    default:
      return "blue";
  }
};

const formatRupiah = (number) => {
  const cleanNumber = parseFloat(number) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanNumber);
};

// Helper to get dueDate from item (handles both dueDate and due_date)
const getDueDate = (item) => {
  return item.due_date || item.dueDate || null;
};

// Format date for display
const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // If it's an ISO string, convert to YYYY-MM-DD
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return dateValue; // Return as is if not a valid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const editDebt = (debt) => {
  emit("edit", debt);
};

const deleteDebt = (debt) => {
  if (confirm(`Are you sure you want to delete debt for ${debt.name}?`)) {
    emit("delete", debt.id);
  }
};

const makePayment = (debt) => {
  emit("makePayment", debt);
};
</script>
