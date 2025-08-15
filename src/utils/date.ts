// src/utils/date.ts
export const parseDate = (dateString: string): Date => {
  const parts = dateString.split(".");
  return new Date(
    parseInt(parts[2], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[0], 10)
  );
};
