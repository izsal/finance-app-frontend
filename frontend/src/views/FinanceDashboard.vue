<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Transactions
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showAddForm">
                <v-icon left>mdi-plus</v-icon>
                Add Transaction
              </v-btn>
            </v-card-title>
            <v-card-text>
              <TransactionList
                :transactions="transactionStore.transactions"
                :loading="transactionStore.loading"
                @edit="handleEditTransaction"
                @delete="handleDeleteTransaction"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add/Edit Transaction Dialog -->
      <v-dialog v-model="dialogVisible" max-width="600px">
        <TransactionForm
          :transaction="editingTransaction"
          :loading="transactionStore.loading"
          @save="handleSaveTransaction"
          @cancel="handleCancelEdit"
        />
      </v-dialog>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
        top
      >
        {{ snackbar.text }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTransactionStore } from "../stores/transaction";
import TransactionForm from "../components/TransactionForm.vue";
import TransactionList from "../components/TransactionList.vue";

const transactionStore = useTransactionStore();

const dialogVisible = ref(false);
const editingTransaction = ref({
  type: "expense",
  category: "",
  description: "",
  amount: 0,
  date: new Date().toISOString().substr(0, 10),
});

const snackbar = ref({
  show: false,
  text: "",
  color: "",
});

onMounted(async () => {
  await transactionStore.fetchTransactions();
});

const showSnackbar = (text, color = "success") => {
  snackbar.value = {
    show: true,
    text,
    color,
  };
};

const showAddForm = () => {
  // Reset form for new transaction
  editingTransaction.value = {
    type: "expense",
    category: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().substr(0, 10),
  };
  dialogVisible.value = true;
};

const handleSaveTransaction = async (transactionData) => {
  try {
    if (editingTransaction.value.id) {
      // Update existing transaction
      await transactionStore.updateTransaction(
        editingTransaction.value.id,
        transactionData
      );
      showSnackbar("Transaction updated successfully!");
    } else {
      // Create new transaction
      await transactionStore.addTransaction(transactionData);
      showSnackbar("Transaction added successfully!");
    }

    // Close dialog
    dialogVisible.value = false;
  } catch (error) {
    showSnackbar(
      "Error saving transaction: " + (error.message || "Unknown error"),
      "error"
    );
  }
};

const handleEditTransaction = (transaction) => {
  // Format date for the form
  const formattedTransaction = {
    ...transaction,
    date: new Date(transaction.date).toISOString().substr(0, 10),
  };

  editingTransaction.value = formattedTransaction;
  dialogVisible.value = true;
  showSnackbar("Editing transaction...");
};

const handleDeleteTransaction = async (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    try {
      await transactionStore.deleteTransaction(id);
      showSnackbar("Transaction deleted successfully!");
    } catch (error) {
      showSnackbar(
        "Error deleting transaction: " + (error.message || "Unknown error"),
        "error"
      );
    }
  }
};

const handleCancelEdit = () => {
  dialogVisible.value = false;
  showSnackbar("Cancelled editing");
};
</script>
