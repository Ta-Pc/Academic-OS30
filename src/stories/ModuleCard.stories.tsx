import React from 'react';
import ModuleCard from '@/components/ModuleCard';

export default { title: 'Components/ModuleCard', component: ModuleCard };

export const Default = () => (
  <ModuleCard
    module={{ id: 'm1', code: 'MATH101', title: 'Calculus I', creditHours: 12, createdAt: new Date() }}
  />
);


