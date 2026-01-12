<template>
  <v-card class="pa-6" elevation="6" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="text-truncate mr-6">Debt Over Time</div>
      <v-select
        v-model="selectedType"
        :items="typeOptions"
        density="compact"
        max-width="200"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-select>
    </v-card-title>
    <div v-if="chartLabels.length === 0" class="text-center py-4">
      <p>No debt data available</p>
    </div>
    <div v-else class="d-flex flex-column align-center">
      <canvas ref="lineChart" width="400" height="250"></canvas>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { useDebtStore } from "../stores/debt";
import Chart from "chart.js/auto";

const debtStore = useDebtStore();
const lineChart = ref(null);
let chartInstance = null;

// Data for chart
const chartLabels = ref([]);
const owedData = ref([]);
const owingData = ref([]);
const netData = ref([]);

function processDebtData() {
  // Group by date (YYYY-MM-DD)
  const grouped = {};
  debtStore.debts.forEach((d) => {
    const date = d.date ? d.date.substr(0, 10) : "Unknown";
    if (!grouped[date]) grouped[date] = { owed: 0, owing: 0 };
    if (d.type === "owed") grouped[date].owed += d.amount;
    if (d.type === "owing") grouped[date].owing += d.amount;
  });
  // Sort by date
  const sortedDates = Object.keys(grouped).sort();
  chartLabels.value = sortedDates;
  owedData.value = sortedDates.map((date) => grouped[date].owed);
  owingData.value = sortedDates.map((date) => grouped[date].owing);
  netData.value = sortedDates.map((date) => grouped[date].owed - grouped[date].owing);
}

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy();
  }
  const ctx = lineChart.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: "Amount Owed to You",
          data: owedData.value,
          borderColor: "#43a047",
          backgroundColor: "rgba(67, 160, 71, 0.1)",
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#43a047",
        },
        {
          label: "Amount You Owe",
          data: owingData.value,
          borderColor: "#e53935",
          backgroundColor: "rgba(229, 57, 53, 0.1)",
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#e53935",
        },
        {
          label: "Net Amount in Your Favor",
          data: netData.value,
          borderColor: "#1e88e5",
          backgroundColor: "rgba(30, 136, 229, 0.1)",
          fill: false,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#1e88e5",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          title: { display: true, text: "Date" },
        },
        y: {
          title: { display: true, text: "Amount (IDR)" },
          beginAtZero: true,
        },
      },
    },
  });
}

watch(
  () => debtStore.debts,
  async () => {
    processDebtData();
    await nextTick();
    renderChart();
  },
  { immediate: true }
);

onMounted(async () => {
  if (debtStore.debts.length === 0) {
    await debtStore.fetchDebts();
  }
  processDebtData();
  await nextTick();
  renderChart();
});
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
