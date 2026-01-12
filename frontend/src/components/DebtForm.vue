<template>
  <v-card>
    <v-card-title>
      {{ isEditing ? "Edit Debt" : "Add New Debt" }}
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12">
            <v-radio-group v-model="form.type" label="Type" row mandatory>
              <v-radio label="Owed (Someone owes me)" value="owed"></v-radio>
              <v-radio label="Owing (I owe someone)" value="owing"></v-radio>
            </v-radio-group>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Person/Entity Name"
              outlined
              dense
              :rules="[(v) => !!v || 'Name is required']"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.description"
              label="Description"
              outlined
              dense
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formattedAmount"
              label="Amount"
              outlined
              dense
              placeholder="Rp 0"
              :rules="[
                (v) =>
                  (!!v && parseRupiah(v) > 0) ||
                  'Amount must be greater than 0',
              ]"
              required
              @blur="handleAmountBlur"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="formattedDate"
                  label="Date"
                  prepend-icon="mdi-calendar"
                  outlined
                  dense
                  v-bind="attrs"
                  v-on="on"
                  @click="dateMenu = true"
                  :rules="[
                    (v) =>
                      !v ||
                      isValidDate(v) ||
                      'Invalid date format (YYYY-MM-DD)',
                  ]"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="selectedDate"
                @input="handleDateInput"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12">
            <v-menu
              v-model="dueDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="formattedDueDate"
                  label="Due Date (Optional)"
                  prepend-icon="mdi-calendar"
                  outlined
                  dense
                  v-bind="attrs"
                  v-on="on"
                  @click="dueDateMenu = true"
                  :rules="[
                    (v) =>
                      !v ||
                      isValidDate(v) ||
                      'Invalid date format (YYYY-MM-DD)',
                  ]"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="selectedDueDate"
                @input="handleDueDateInput"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="cancel">Cancel</v-btn>
      <v-btn color="primary" @click="handleSubmit" :loading="loading">
        {{ isEditing ? "Update" : "Add" }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  debt: {
    type: Object,
    default: () => ({
      type: "owing",
      name: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().substr(0, 10),
      dueDate: null,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "cancel"]);

// Helper to get dueDate from debt object (handles both dueDate and due_date)
function getDueDate(debt) {
  return debt.due_date || debt.dueDate || null;
}

const form = ref({
  ...props.debt,
  date: props.debt.date
    ? formatDateForDisplay(props.debt.date)
    : new Date().toISOString().slice(0, 10),
  dueDate: getDueDate(props.debt)
    ? formatDateForDisplay(getDueDate(props.debt))
    : null,
});
const dateMenu = ref(false);
const dueDateMenu = ref(false);
const selectedDate = ref(
  props.debt.date
    ? formatDateForDisplay(props.debt.date)
    : new Date().toISOString().substr(0, 10)
);
const selectedDueDate = ref(
  getDueDate(props.debt) ? formatDateForDisplay(getDueDate(props.debt)) : null
);

const isEditing = computed(() => !!props.debt.id);

// Format amount as Rupiah for display
const formattedAmount = computed({
  get() {
    if (form.value.amount === 0 || form.value.amount === "") {
      return "";
    }
    return formatRupiah(form.value.amount);
  },
  set(value) {
    // Store the numeric value in the form
    form.value.amount = parseRupiah(value);
  },
});

const formattedDate = computed({
  get: () => {
    return form.value.date ? formatDateForDisplay(form.value.date) : "";
  },
  set: (value) => {
    // Validate date format
    if (value && !isValidDate(value)) {
      return; // Don't update if invalid date format
    }
    form.value.date = value;
  },
});

const formattedDueDate = computed({
  get: () => {
    return form.value.dueDate ? formatDateForDisplay(form.value.dueDate) : "";
  },
  set: (value) => {
    // Validate date format
    if (value && !isValidDate(value)) {
      return; // Don't update if invalid date format
    }
    form.value.dueDate = value;
  },
});

// Validate if the date string is in the correct format (YYYY-MM-DD)
function isValidDate(dateString) {
  if (!dateString) return true; // Optional field

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Format date for display (convert ISO string to YYYY-MM-DD if needed)
function formatDateForDisplay(dateValue) {
  if (!dateValue) return "";

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
}

// Format date for input (date picker returns YYYY-MM-DD, so just return as is)
function formatDateForInput(dateValue) {
  if (!dateValue) return null;
  // Date picker already returns YYYY-MM-DD format
  return dateValue;
}

// Format number as Rupiah currency
function formatRupiah(number) {
  // Convert to string and remove any non-digit characters except decimal point
  const cleanNumber = parseFloat(number) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanNumber);
}

// Parse Rupiah string back to number
function parseRupiah(rupiahString) {
  if (!rupiahString) return 0;

  // Remove "Rp" prefix, spaces, dots, and commas
  const cleanString = rupiahString
    .replace(/Rp/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .trim();

  // Convert to number
  return parseFloat(cleanString) || 0;
}

// Handle blur event to format the amount
function handleAmountBlur() {
  if (form.value.amount > 0) {
    // This will trigger the getter to reformat the value
    const currentValue = form.value.amount;
    form.value.amount = currentValue;
  }
}

// Handle date selection from date picker
function handleDateInput() {
  dateMenu.value = false;
  if (selectedDate.value) {
    const formattedDate = formatDateForInput(selectedDate.value);
    form.value.date = formattedDate;
  }
}

// Handle due date selection from date picker
function handleDueDateInput() {
  dueDateMenu.value = false;
  if (selectedDueDate.value) {
    const formattedDate = formatDateForInput(selectedDueDate.value);
    form.value.dueDate = formattedDate;
  } else {
    form.value.dueDate = null;
  }
}

const handleSubmit = () => {
  // Validate form
  if (!form.value.name || !form.value.amount || form.value.amount <= 0) {
    return;
  }

  // Validate dates
  if (form.value.date && !isValidDate(form.value.date)) {
    return; // Date validation will show error
  }
  if (form.value.dueDate && !isValidDate(form.value.dueDate)) {
    return; // Due date validation will show error
  }

  // Prepare data for submission
  // Convert dueDate to due_date for backend (snake_case)
  // Ensure empty string becomes null
  const dueDateValue =
    form.value.dueDate && form.value.dueDate.trim() !== ""
      ? new Date(form.value.dueDate).toISOString()
      : null;

  const submitData = {
    type: form.value.type,
    name: form.value.name,
    description: form.value.description || "",
    amount: form.value.amount,
    date: new Date(form.value.date).toISOString(),
    due_date: dueDateValue, // Send as due_date (snake_case) for backend
  };

  emit("save", submitData);
};

const cancel = () => {
  emit("cancel");
};

// Watch for changes in props.debt to update form and selected dates
watch(
  () => props.debt,
  (newVal) => {
    // Create a copy of the new debt value
    const newDebt = { ...newVal };

    // Format dates to YYYY-MM-DD if they're in ISO format
    if (newDebt.date) {
      newDebt.date = formatDateForDisplay(newDebt.date);
    }

    // Handle both dueDate and due_date field names
    const dueDate = getDueDate(newDebt);
    if (dueDate) {
      newDebt.dueDate = formatDateForDisplay(dueDate);
    } else {
      newDebt.dueDate = null;
    }

    form.value = newDebt;
    selectedDate.value = newDebt.date || new Date().toISOString().substr(0, 10);
    selectedDueDate.value = newDebt.dueDate || null;
  },
  { deep: true }
);

// Watch for manual input changes in form.date
watch(
  () => form.value.date,
  (newDate) => {
    if (newDate && isValidDate(newDate)) {
      selectedDate.value = newDate;
    }
  }
);

// Watch for manual input changes in form.dueDate
watch(
  () => form.value.dueDate,
  (newDueDate) => {
    if (newDueDate && isValidDate(newDueDate)) {
      selectedDueDate.value = newDueDate;
    } else if (!newDueDate) {
      selectedDueDate.value = null;
    }
  }
);
</script>
