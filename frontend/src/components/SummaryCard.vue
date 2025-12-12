<template>
  <v-card>
    <v-card-title>Financial Summary</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="summary-card income">
            <v-card-text class="text-center">
              <div class="summary-title">Income</div>
              <div class="summary-amount green--text">
                Rp{{ formatRupiah(summary.income) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" class="summary-card expense">
            <v-card-text class="text-center">
              <div class="summary-title">Expense</div>
              <div class="summary-amount red--text">
                Rp{{ formatRupiah(summary.expense) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            elevation="2"
            class="summary-card balance"
            :class="{ 'red--text': summary.balance < 0 }"
          >
            <v-card-text class="text-center">
              <div class="summary-title">Balance</div>
              <div
                class="summary-amount"
                :class="summary.balance >= 0 ? 'blue--text' : 'red--text'"
              >
                Rp{{ formatRupiah(summary.balance) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: () => ({
      income: 0,
      expense: 0,
      balance: 0,
    }),
  },
});

function formatRupiah(number) {
  // Convert to absolute value and format as rupiah
  const absNumber = Math.abs(number);
  return new Intl.NumberFormat("id-ID").format(absNumber);
}
</script>

<style scoped>
.summary-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 10px;
}

.summary-amount {
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
