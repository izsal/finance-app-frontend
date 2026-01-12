<template>
  <div>
    <v-container>
      <!-- Summary Cards -->
      <v-row>
        <v-col cols="12" md="4">
          <v-card color="green lighten-1" dark>
            <v-card-title class="text-h5">
              {{ formatRupiah(debtStore.summary.owed) }}
            </v-card-title>
            <v-card-subtitle>Amount Owed to You</v-card-subtitle>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="red lighten-1" dark>
            <v-card-title class="text-h5">
              {{ formatRupiah(debtStore.summary.owing) }}
            </v-card-title>
            <v-card-subtitle>Amount You Owe</v-card-subtitle>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card
            :color="
              debtStore.summary.balance >= 0
                ? 'blue lighten-1'
                : 'orange lighten-1'
            "
            dark
          >
            <v-card-title class="text-h5">
              {{ formatRupiah(Math.abs(debtStore.summary.balance)) }}
            </v-card-title>
            <v-card-subtitle>
              {{
                debtStore.summary.balance >= 0
                  ? "Net Amount in Your Favor"
                  : "Net Amount Against You"
              }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- Debt Management Section -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Debt Management
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showAddForm">
                <v-icon left>mdi-plus</v-icon>
                Add Debt
              </v-btn>
            </v-card-title>
            <v-card-text>
              <DebtList
                :debts="debtStore.debts"
                :loading="debtStore.loading"
                @edit="showEditForm"
                @delete="deleteDebt"
                @makePayment="showPaymentForm"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add/Edit Debt Dialog -->
    <v-dialog v-model="dialogVisible" max-width="600px">
      <DebtForm
        :debt="editingDebt"
        :loading="debtStore.loading"
        @save="handleSaveDebt"
        @cancel="dialogVisible = false"
      />
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialogVisible" max-width="600px">
      <PaymentForm
        :debt="selectedDebt"
        :loading="debtStore.loading"
        @save="handleMakePayment"
        @cancel="paymentDialogVisible = false"
      />
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn text @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDebtStore } from "../stores/debt";
import DebtForm from "../components/DebtForm.vue";
import DebtList from "../components/DebtList.vue";
import PaymentForm from "../components/PaymentForm.vue";

const debtStore = useDebtStore();

const dialogVisible = ref(false);
const paymentDialogVisible = ref(false);
const selectedDebt = ref({});

const editingDebt = ref({
  type: "owing",
  name: "",
  description: "",
  amount: 0,
  date: new Date().toISOString().substr(0, 10),
  dueDate: null,
});

const snackbar = ref({
  show: false,
  text: "",
  color: "",
});

onMounted(async () => {
  await debtStore.fetchDebts();
});

const showSnackbar = (text, color = "success") => {
  snackbar.value = {
    show: true,
    text,
    color,
  };
};

const showAddForm = () => {
  // Reset form for new debt
  editingDebt.value = {
    type: "owing",
    name: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().substr(0, 10),
    dueDate: null,
  };
  dialogVisible.value = true;
};

const showEditForm = (debt) => {
  editingDebt.value = { ...debt };
  dialogVisible.value = true;
};

const handleSaveDebt = async (debtData) => {
  try {
    if (editingDebt.value.id) {
      // Update existing debt
      await debtStore.updateDebt(editingDebt.value.id, debtData);
      showSnackbar("Debt updated successfully!");
    } else {
      // Create new debt
      await debtStore.addDebt(debtData);
      showSnackbar("Debt added successfully!");
    }
    dialogVisible.value = false;
    await debtStore.fetchDebts(); // Refresh the list
  } catch (error) {
    showSnackbar(
      "Error saving debt: " + (error.response?.data?.error || error.message),
      "error"
    );
  }
};

const deleteDebt = async (id) => {
  try {
    await debtStore.deleteDebt(id);
    showSnackbar("Debt deleted successfully!");
    await debtStore.fetchDebts(); // Refresh the list
  } catch (error) {
    showSnackbar(
      "Error deleting debt: " + (error.response?.data?.error || error.message),
      "error"
    );
  }
};

const showPaymentForm = (debt) => {
  selectedDebt.value = { ...debt };
  paymentDialogVisible.value = true;
};

const handleMakePayment = async (debtId, paymentData) => {
  try {
    await debtStore.makePayment(debtId, paymentData);
    showSnackbar("Payment made successfully!");
    paymentDialogVisible.value = false;
    await debtStore.fetchDebts(); // Refresh the list
  } catch (error) {
    showSnackbar(
      "Error making payment: " + (error.response?.data?.error || error.message),
      "error"
    );
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
</script>
