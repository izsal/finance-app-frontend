<template>
  <v-card>
    <v-card-title> Make Payment on Debt </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Person/Entity Name"
              outlined
              dense
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.description"
              label="Description"
              outlined
              dense
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="originalAmountDisplay"
              label="Original Amount"
              outlined
              dense
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="remainingAmountDisplay"
              label="Remaining Amount"
              outlined
              dense
              readonly
              :class="form.remaining <= 0 ? 'green--text' : ''"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formattedPayment"
              label="Payment Amount"
              outlined
              dense
              placeholder="Rp 0"
              :rules="[
                (v) =>
                  (!!v && parseRupiah(v) > 0) ||
                  'Payment amount must be greater than 0',
                (v) =>
                  parseRupiah(v) <= form.remaining ||
                  'Payment cannot exceed remaining amount',
              ]"
              required
              @blur="handleAmountBlur"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="cancel">Cancel</v-btn>
      <v-btn
        color="primary"
        @click="handleSubmit"
        :loading="loading"
        :disabled="form.remaining <= 0"
      >
        Make Payment
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
      id: null,
      name: "",
      description: "",
      amount: 0,
      remaining: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = ref({ ...props.debt });
const paymentAmount = ref(0);

// Format amount as Rupiah for display
const formattedPayment = computed({
  get() {
    if (paymentAmount.value === 0 || paymentAmount.value === "") {
      return "";
    }
    return formatRupiah(paymentAmount.value);
  },
  set(value) {
    // Store the numeric value in the paymentAmount
    paymentAmount.value = parseRupiah(value);
  },
});

const originalAmountDisplay = computed(() => {
  return formatRupiah(form.value.amount);
});

const remainingAmountDisplay = computed(() => {
  return formatRupiah(form.value.remaining);
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
  if (paymentAmount.value > 0) {
    // This will trigger the getter to reformat the value
    const currentValue = paymentAmount.value;
    paymentAmount.value = currentValue;
  }
}

const handleSubmit = () => {
  // Validate form
  if (
    !paymentAmount.value ||
    paymentAmount.value <= 0 ||
    paymentAmount.value > form.value.remaining
  ) {
    return;
  }

  // Prepare data for submission
  const submitData = {
    amount: paymentAmount.value,
  };

  emit("save", form.value.id, submitData);
};

const cancel = () => {
  emit("cancel");
};

// Watch for changes in props.debt
watch(
  () => props.debt,
  (newVal) => {
    form.value = { ...newVal };
    paymentAmount.value = 0; // Reset payment amount when debt changes
  },
  { deep: true }
);
</script>
