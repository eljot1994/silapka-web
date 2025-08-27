<template>
  <li class="exercise-card" :class="{ 'exercise-done': exercise.done }">
    <div class="card-header">
      <span class="exercise-name">{{ exercise.name }}</span>
      <button
        @click="$emit('remove-exercise', exercise.id)"
        class="icon-button remove-exercise-button"
        title="Usuń ćwiczenie z planu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          />
        </svg>
      </button>
    </div>

    <div class="card-content">
      <template v-if="exercise.category === 'strength'">
        <ul class="set-list">
          <li
            v-for="(set, index) in exercise.sets"
            :key="set.id"
            class="set-item"
            :class="{ 'set-done': set.done }"
          >
            <button
              @click="
                $emit('toggle-set-done', { exercise, setId: set.id, index })
              "
              class="set-status-button"
              :disabled="
                !isTrainingActive ||
                isTrainingPaused ||
                isSetLocked(exercise.sets, index)
              "
            >
              <span v-if="!set.done" class="set-index">{{ index + 1 }}</span>
              <svg
                v-else
                class="set-check-icon"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="white"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </button>
            <div class="set-inputs">
              <div class="input-group">
                <label :for="`weight-${set.id}`"
                  >Ciężar ({{ weightUnitLabel }})</label
                >
                <input
                  :id="`weight-${set.id}`"
                  type="number"
                  :value="formatWeight(set.weight, weightUnit)"
                  @input="handleSetChange($event, set, 'weight')"
                  placeholder="0"
                />
              </div>
              <div class="input-group">
                <label :for="`reps-${set.id}`">Powtórzenia</label>
                <input
                  :id="`reps-${set.id}`"
                  type="number"
                  :value="set.reps"
                  @input="handleSetChange($event, set, 'reps')"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              @click="
                $emit('remove-set', { exerciseId: exercise.id, setId: set.id })
              "
              class="icon-button remove-set-button"
              title="Usuń serię"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </li>
        </ul>
        <button @click="$emit('add-set', exercise.id)" class="add-set-button">
          + Dodaj serię
        </button>
      </template>

      <template v-else>
        <div class="other-exercise-wrapper">
          <button
            @click="$emit('toggle-exercise-done', exercise.id)"
            class="set-status-button"
            :class="{ done: exercise.done }"
            :disabled="!isTrainingActive || isTrainingPaused"
          >
            <svg
              v-if="exercise.done"
              class="set-check-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="white"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
          <div class="other-exercise-inputs">
            <div class="input-group" v-if="exercise.duration !== undefined">
              <label>Długość (min)</label>
              <input
                type="number"
                :value="exercise.duration"
                @input="handleExerciseChange($event, 'duration')"
                placeholder="0"
              />
            </div>
            <div class="input-group" v-if="exercise.reps !== undefined">
              <label>Powtórzenia</label>
              <input
                type="number"
                :value="exercise.reps"
                @input="handleExerciseChange($event, 'reps')"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useStore } from "vuex";
import { PlannedExercise, Set } from "@/store";
import { formatWeight, parseWeight } from "@/utils/weight";

export default defineComponent({
  name: "ExerciseCard",
  props: {
    exercise: {
      type: Object as PropType<PlannedExercise>,
      required: true,
    },
    isTrainingActive: {
      type: Boolean,
      required: true,
    },
    isTrainingPaused: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    "remove-exercise",
    "toggle-set-done",
    "update-set",
    "remove-set",
    "add-set",
    "toggle-exercise-done",
    "update-exercise",
  ],
  setup(props, { emit }) {
    const store = useStore();
    const weightUnit = computed(() => store.getters.userSettings.weightUnit);
    const weightUnitLabel = computed(() => weightUnit.value);

    const isSetLocked = (sets: Set[] | undefined, index: number) => {
      if (!sets || index === 0) {
        return false;
      }
      return !sets[index - 1].done;
    };

    const handleSetChange = (
      event: Event,
      set: Set,
      field: "weight" | "reps"
    ) => {
      const value = (event.target as HTMLInputElement).value;
      let numericValue: number | null = Number(value);
      if (field === "weight") {
        numericValue = parseWeight(value, weightUnit.value);
      }
      const updatedSet = { ...set, [field]: numericValue };
      emit("update-set", { exerciseId: props.exercise.id, set: updatedSet });
    };

    const handleExerciseChange = (event: Event, field: "duration" | "reps") => {
      const value = (event.target as HTMLInputElement).value;
      const updatedExercise = { ...props.exercise, [field]: Number(value) };
      emit("update-exercise", updatedExercise);
    };

    return {
      isSetLocked,
      handleSetChange,
      handleExerciseChange,
      weightUnit: weightUnit.value,
      weightUnitLabel,
      formatWeight,
    };
  },
});
</script>

<style scoped>
.exercise-card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.exercise-done > .card-header {
  border-left: 5px solid #42b983;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f7f9fc;
  border-left: 5px solid transparent;
}
.exercise-name {
  font-weight: bold;
  font-size: 1.2em;
}
.remove-exercise-button {
  color: #888;
}
.card-content {
  padding: 15px;
}
.set-status-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.set-status-button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}
.set-status-button.done,
.set-item.set-done .set-status-button {
  background-color: #42b983;
  border-color: #42b983;
}
.set-check-icon {
  fill: white;
}
.set-index {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}
.set-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.set-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.set-inputs {
  display: flex;
  flex-grow: 1;
  gap: 10px;
  min-width: 0;
}
.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.input-group label {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 4px;
}
.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 1.1em;
}
.remove-set-button {
  color: #e57373;
  flex-shrink: 0;
}
.add-set-button {
  background: none;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  margin-top: 15px;
  color: #666;
  font-weight: bold;
}
.other-exercise-wrapper {
  display: flex;
  gap: 15px;
  align-items: center;
}
.other-exercise-inputs {
  flex-grow: 1;
  display: flex;
  gap: 15px;
}
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
}
</style>
