export function getMatchPresentation(score: number) {
  if (score >= 85) return {
    label: 'Excellent alignment',
    background: '#D1FAE5',
    color: '#065F46',
    bar: '#047857'
  };

  if (score >= 70) return {
    label: 'Strong alignment',
    background: '#E5F4E3',
    color: '#39713C',
    bar: '#52864D'
  };

  if (score >= 55) return {
    label: 'Moderate alignment',
    background: '#FEF3C7',
    color: '#92400E',
    bar: '#B68525'
  };

  if (score >= 40) return {
    label: 'Exploratory alignment',
    background: '#FFEDD5',
    color: '#9A3412',
    bar: '#C56B32'
  };

  return {
    label: 'Limited alignment',
    background: '#F1F1F1',
    color: '#606060',
    bar: '#858585'
  };
}
