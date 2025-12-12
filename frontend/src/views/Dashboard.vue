<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <SummaryCard :summary="transactionStore.summary" />
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <!-- Pie Chart -->
        <v-col cols="12" md="6">
          <PieChart />
        </v-col>

        <!-- Recent Transactions -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Recent Transactions</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="recentTransactions"
                :loading="transactionStore.loading"
                loading-text="Loading transactions..."
                no-data-text="No transactions found"
                class="elevation-1"
                hide-default-footer
                :items-per-page="5"
              >
                <template v-slot:item.amount="{ item }">
                  <span
                    :class="
                      item.type === 'income' ? 'green--text' : 'red--text'
                    "
                  >
                    {{ item.type === "income" ? "+" : "-" }}Rp{{
                      formatRupiah(item.amount)
                    }}
                  </span>
                </template>

                <template v-slot:item.date="{ item }">
                  {{ formatDate(item.date) }}
                </template>
              </v-data-table>
              <v-btn color="primary" class="mt-4" @click="goToFinance">
                View All Transactions
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTransactionStore } from "../stores/transaction";
import SummaryCard from "../components/SummaryCard.vue";
import PieChart from "../components/PieChart.vue";

const transactionStore = useTransactionStore();
const router = useRouter();

// Updated headers for Vuetify 3
const headers = [
  { title: "Date", key: "date", sortable: true },
  { title: "Type", key: "type", sortable: true },
  { title: "Category", key: "category", sortable: true },
  { title: "Description", key: "description", sortable: false },
  { title: "Amount", key: "amount", sortable: true },
];

onMounted(async () => {
  await transactionStore.fetchTransactions();
});

const recentTransactions = computed(() => {
  // Get last 5 transactions
  return transactionStore.transactions.slice(0, 5);
});

function goToFinance() {
  router.push("/finance");
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID");
}
</script>
