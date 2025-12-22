<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Expense Categories
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="categoryStore.expenseCategories"
                :search="search"
                :loading="categoryStore.loading"
                loading-text="Loading categories..."
                no-data-text="No expense categories found"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-icon small class="mr-2" @click="editCategory(item)">
                    mdi-pencil
                  </v-icon>
                  <v-icon small @click="deleteCategory(item)">
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Add New Expense Category</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="addCategory">
                <v-text-field
                  v-model="newCategory.name"
                  label="Category Name"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Category name is required']"
                  required
                ></v-text-field>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="categoryStore.loading"
                >
                  Add Category
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>Edit Category</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updateCategory">
            <v-text-field
              v-model="editingCategory.name"
              label="Category Name"
              outlined
              dense
              :rules="[(v) => !!v || 'Category name is required']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogVisible = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="updateCategory"
            :loading="categoryStore.loading"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
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
import { useCategoryStore } from "../stores/category";

const categoryStore = useCategoryStore();

const search = ref("");
const dialogVisible = ref(false);
const newCategory = ref({ name: "" });

const editingCategory = ref({
  id: null,
  name: "",
});

const snackbar = ref({
  show: false,
  text: "",
  color: "",
});

const headers = [
  { title: "Name", key: "name", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

onMounted(async () => {
  await categoryStore.fetchCategories("expense");
});

const showSnackbar = (text, color = "success") => {
  snackbar.value = {
    show: true,
    text,
    color,
  };
};

const addCategory = async () => {
  if (!newCategory.value.name.trim()) return;

  try {
    await categoryStore.addCategory({
      name: newCategory.value.name,
      type: "expense",
    });
    newCategory.value.name = "";
    showSnackbar("Category added successfully!");
  } catch (error) {
    showSnackbar(error.message || "Failed to add category", "error");
  }
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
  dialogVisible.value = true;
};

const updateCategory = async () => {
  if (!editingCategory.value.name.trim()) return;

  try {
    await categoryStore.updateCategory(editingCategory.value.id, {
      name: editingCategory.value.name,
      type: "expense",
    });
    dialogVisible.value = false;
    showSnackbar("Category updated successfully!");
  } catch (error) {
    showSnackbar(error.message || "Failed to update category", "error");
  }
};

const deleteCategory = async (category) => {
  if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
    try {
      await categoryStore.deleteCategory(category.id, "expense");
      showSnackbar("Category deleted successfully!");
    } catch (error) {
      showSnackbar(error.message || "Failed to delete category", "error");
    }
  }
};
</script>
