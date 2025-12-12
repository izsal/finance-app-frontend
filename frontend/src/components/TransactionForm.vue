<template>
  <v-card>
    <v-card-title>{{
      isEditing ? "Edit Transaction" : "Add New Transaction"
    }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12">
            <v-radio-group v-model="form.type" label="Type" row mandatory>
              <v-radio label="Income" value="income"></v-radio>
              <v-radio label="Expense" value="expense"></v-radio>
            </v-radio-group>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.category"
              label="Category"
              outlined
              dense
              :rules="[(v) => !!v || 'Category is required']"
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
                  readonly
                  outlined
                  dense
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.date"
                @input="dateMenu = false"
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
  transaction: {
    type: Object,
    default: () => ({
      type: "expense",
      category: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().substr(0, 10),
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = ref({ ...props.transaction });
const dateMenu = ref(false);

const isEditing = computed(() => !!props.transaction.id);

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
  get: () => form.value.date,
  set: (value) => {
    form.value.date = value;
  },
});

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

const handleSubmit = () => {
  // Validate form
  if (!form.value.category || !form.value.amount || form.value.amount <= 0) {
    return;
  }

  // Prepare data for submission
  const submitData = {
    ...form.value,
    // Ensure date is in the correct format for the backend
    date: new Date(form.value.date).toISOString(),
  };

  emit("save", submitData);
};

const cancel = () => {
  emit("cancel");
};

// Watch for changes in props.transaction
watch(
  () => props.transaction,
  (newVal) => {
    form.value = { ...newVal };
  },
  { deep: true }
);
</script>
