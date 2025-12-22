import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import TodoList from "../views/Todolist.vue";
import FinanceDashboard from "../views/FinanceDashboard.vue";
import Dashboard from "../views/Dashboard.vue";
import IncomeCategories from "../views/IncomeCategories.vue";
import ExpenseCategories from "../views/ExpenseCategories.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/todolist",
    component: TodoList,
  },
  {
    path: "/finance",
    component: FinanceDashboard,
  },
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/categories/income",
    component: IncomeCategories,
  },
  {
    path: "/categories/expense",
    component: ExpenseCategories,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
