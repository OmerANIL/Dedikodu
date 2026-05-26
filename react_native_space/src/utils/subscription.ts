export function getSubscriptionBadge(level?: string) {
  switch (level) {
    case 'gold':
      return { label: 'Gold', bgColor: '#F59E0B20', textColor: '#F59E0B' };
    case 'platinum':
      return { label: 'Platin', bgColor: '#8B5CF620', textColor: '#8B5CF6' };
    default:
      return { label: 'Temel', bgColor: '#6B728020', textColor: '#6B7280' };
  }
}
