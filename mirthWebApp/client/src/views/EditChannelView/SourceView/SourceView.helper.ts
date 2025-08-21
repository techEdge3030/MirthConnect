export const getIntervalUnit = (interval: number) => {
  const unitValue = [1000, 60, 60];
  const unitName = ['miliseconds', 'seconds', 'minutes', 'hours'];
  let value = interval;
  let i;

  for (i = 0; value > unitValue[i] && i < unitValue.length; i++) {
    value /= unitValue[i];
  }

  return { value, unit: unitName[i] };
};
