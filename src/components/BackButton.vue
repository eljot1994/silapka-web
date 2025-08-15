<template>
  <button @click="navigate" class="back-button">&larr; {{ text }}</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useRouter, RouteLocationRaw } from "vue-router";

export default defineComponent({
  name: "BackButton",
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      default: null,
    },
    text: {
      type: String,
      default: "Wróć",
    },
  },
  setup(props) {
    const router = useRouter();
    const navigate = () => {
      if (props.to) {
        router.push(props.to);
      } else {
        router.go(-1); // Domyślnie cofa o jedną stronę
      }
    };
    return { navigate };
  },
});
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: #007bff;
}
</style>
