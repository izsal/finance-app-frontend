<template>
  <v-card class="pa-6" elevation="6" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="text-truncate mr-6">Expenses by Category</div>
      <v-select
        v-model="selectedGroup"
        :items="groupOptions"
        density="compact"
        max-width="200"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-select>
    </v-card-title>

    <div v-if="expenseTransactions.length === 0" class="text-center py-4">
      <p>No expense data available</p>
    </div>
    <div v-else class="d-flex flex-column align-center">
      <!-- Custom Pie Chart using SVG -->
      <div class="pie-chart-container">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <!-- Background circle -->
          <circle
            cx="150"
            cy="150"
            r="100"
            fill="none"
            stroke="#f5f5f5"
            stroke-width="30"
          />

          <!-- Pie slices with better styling -->
          <g>
            <path
              v-for="(slice, index) in pieSlices"
              :key="index"
              :d="slice.path"
              :fill="slice.color"
              stroke="#ffffff"
              stroke-width="2"
              :stroke-opacity="0.8"
            />
          </g>

          <!-- Center circle with shadow effect -->
          <circle cx="150" cy="150" r="50" fill="#ffffff" />
          <circle
            cx="150"
            cy="150"
            r="50"
            fill="none"
            stroke="#eeeeee"
            stroke-width="1"
          />

          <!-- Center text -->
          <text
            x="150"
            y="140"
            text-anchor="middle"
            dominant-baseline="middle"
            font-weight="bold"
            font-size="20"
            fill="#333333"
          >
            Rp{{ formatRupiah(totalExpenses) }}
          </text>
          <text
            x="150"
            y="170"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="16"
            fill="#666666"
          >
            Total
          </text>
        </svg>
      </div>

      <!-- Enhanced Legend -->
      <div class="legend mt-6" style="width: 100%; max-width: 400px">
        <v-list class="py-0" density="compact">
          <v-list-item
            v-for="(item, index) in chartData"
            :key="index"
            class="my-1"
            rounded="lg"
            style="min-height: 40px"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="item.color"
                :size="16"
                style="border: 1px solid #e0e0e0"
              ></v-avatar>
            </template>

            <v-list-item-title>
              <div
                class="d-flex justify-space-between align-center"
                style="width: 100%"
              >
                <span class="text-body-2 font-weight-medium" style="flex: 1">{{
                  item.category
                }}</span>
                <span class="text-body-2 font-weight-regular mr-2"
                  >Rp{{ formatRupiah(item.amount) }}</span
                >
                <span class="text-body-2 font-weight-bold"
                  >{{ item.percentage }}%</span
                >
              </div>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "../stores/transaction";

const transactionStore = useTransactionStore();
const selectedGroup = ref("Transactions");
const groupOptions = ref(["Transactions"]);

// Get expense transactions directly
const expenseTransactions = computed(() => {
  return transactionStore.expenseTransactions || [];
});

// Process chart data
const chartData = computed(() => {
  // Group expenses by category
  const expenseCategories = {};

  expenseTransactions.value.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    if (!expenseCategories[category]) {
      expenseCategories[category] = 0;
    }
    expenseCategories[category] += transaction.amount;
  });

  // Convert to chart format
  const labels = Object.keys(expenseCategories);
  const data = Object.values(expenseCategories);

  // Define colors for the chart (Vuetify-inspired palette)
  const backgroundColors = [
    "#1976D2", // blue-darken-2
    "#4CAF50", // green
    "#FFC107", // amber
    "#FF5722", // deep-orange
    "#9C27B0", // purple
    "#00BCD4", // cyan
    "#FF9800", // orange
    "#8BC34A", // light-green
    "#795548", // brown
    "#607D8B", // blue-grey
  ];

  // Create chart data array
  const chartArray = labels.map((label, index) => {
    return {
      category: label,
      amount: data[index],
      color: backgroundColors[index] || "#CCCCCC", // Fallback color
      percentage: 0, // Will be calculated below
    };
  });

  // Calculate percentages
  const total = chartArray.reduce((sum, item) => sum + item.amount, 0);
  chartArray.forEach((item) => {
    item.percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
  });

  return chartArray;
});

// Calculate total expenses
const totalExpenses = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.amount, 0);
});

// Generate pie slices for SVG
const pieSlices = computed(() => {
  const data = chartData.value;
  const total = totalExpenses.value;

  if (total === 0) return [];

  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  let startAngle = -Math.PI / 2; // Start from top

  const slices = data
    .map((item, index) => {
      // Skip slices with 0 value
      if (item.amount === 0) return null;

      const sliceAngle = (item.amount / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Calculate coordinates for the slice
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      // Create path for the slice
      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      startAngle = endAngle;

      return {
        path: path,
        color: item.color,
      };
    })
    .filter((slice) => slice !== null); // Remove null slices

  return slices;
});

// Format currency
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

// Initialize the store if not already loaded
onMounted(async () => {
  if (transactionStore.transactions.length === 0) {
    await transactionStore.fetchTransactions();
  }
});
</script>

<style scoped>
.pie-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.legend {
  max-width: 300px;
}
</style>
