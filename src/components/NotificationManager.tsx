'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  weight: number | null;
  score: number | null;
  status: string;
}

interface AssignmentsResponse {
  assignments: Assignment[];
}

const fetchAssignments = async (): Promise<AssignmentsResponse> => {
  const response = await fetch('/api/assignments');
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
};

const NotificationManager = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const { data: assignmentsData } = useQuery('assignments', fetchAssignments);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      permission === 'granted' &&
      assignmentsData
    ) {
      const now = new Date();
      assignmentsData.assignments.forEach((assignment: Assignment) => {
        if (assignment.dueDate) {
          const dueDate = new Date(assignment.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const hoursUntilDue = timeDiff / (1000 * 60 * 60);

          if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
            new Notification('Assignment Due Soon', {
              body: `${assignment.title} is due in less than 24 hours.`,
              icon: '/favicon.ico',
            });
          }
        }
      });
    }
  }, [permission, assignmentsData]);

  return null;
};

export default NotificationManager;
