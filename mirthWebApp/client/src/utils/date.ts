export const formatDate = (date: Date) => {
  const result = date.toISOString().replace(/T/, ' ').substr(0, 16);
  return result;
};
