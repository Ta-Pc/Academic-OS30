import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeeklyViewContainer } from '@/academic-os/components/views/WeeklyViewContainer';
import { AcademicOSProvider } from '@/academic-os/context/AcademicOSContext';

// Mock the fetch API
global.fetch = jest.fn();

// Mock the UI components
jest.mock('@ui/forms/Button.view', () => ({
  Button: ({ children, ...props }: any) => {
    return React.createElement('button', props, children);
  },
}));

jest.mock('@ui/modules/ModuleQuickView.view', () => ({
  ModuleQuickView: ({ moduleId }: any) => {
    return React.createElement('div', { 'data-testid': 'module-quick-view' }, `Module Quick View: ${moduleId}`);
  },
}));

jest.mock('@ui/layout/Card.view', () => ({
  Card: ({ children, className, hover, clickable, onClick }: any) => {
    return React.createElement('div', { 
      className, 
      'data-hover': hover,
      'data-clickable': clickable,
      onClick 
    }, children);
  },
  CardHeader: ({ children, gradient, className }: any) => {
    return React.createElement('div', { className, 'data-gradient': gradient }, children);
  },
  CardBody: ({ children, padding, className }: any) => {
    return React.createElement('div', { className, 'data-padding': padding }, children);
  },
}));

jest.mock('@ui/layout/PageHeader.view', () => ({
  PageHeaderView: ({ title, subtitle, icon, actions }: any) => {
    return React.createElement('header', null, 
      React.createElement('h1', null, title),
      React.createElement('p', null, subtitle),
      React.createElement('div', null, icon),
      React.createElement('div', null, actions)
    );
  },
}));

const mockWeeklyData = {
  weekRange: { start: '2024-01-01', end: '2024-01-07' },
  moduleSummaries: [
    {
      id: 'module-1',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      currentAverageMark: 85,
      targetMark: 90,
      creditHours: 3,
      assignmentsDueThisWeek: 2,
      color: '#3b82f6',
      isCore: true,
      electiveGroup: null,
      nextDueDate: '2024-01-05',
      daysUntilNextDue: 4,
      assignmentCount: 5,
      taskCount: 3,
      priorityScore: 75,
    },
  ],
  weeklyPriorities: [
    {
      id: 'priority-1',
      title: 'Complete Assignment 1',
      moduleCode: 'CS101',
      priorityScore: 85,
      dueDate: '2024-01-05',
      status: 'PENDING' as const,
      type: 'ASSIGNMENT' as const,
      weight: 20,
    },
    {
      id: 'priority-2',
      title: 'Study for Quiz',
      moduleCode: 'CS101',
      priorityScore: 65,
      dueDate: '2024-01-03',
      status: 'PENDING' as const,
      type: 'TACTICAL_TASK' as const,
    },
  ],
  tacticalTasks: [
    {
      id: 'task-1',
      title: 'Read Chapter 3',
      moduleCode: 'CS101',
      priority: 'HIGH' as const,
      completed: false,
      dueDate: '2024-01-04',
      status: 'PENDING',
    },
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Assignment 1',
      dueDate: '2024-01-05',
      weight: 20,
      score: null,
      status: 'PENDING',
      module: {
        id: 'module-1',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        isCore: true,
      },
    },
  ],
  totalStudyMinutes: 300,
};

describe('WeeklyViewContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to show loading state
    );

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    expect(screen.getByText('Loading weekly data...')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load weekly data')).toBeInTheDocument();
    });
  });

  it('renders weekly data successfully', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWeeklyData,
    });

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    await waitFor(() => {
      expect(screen.getByText('Weekly Mission Brief')).toBeInTheDocument();
      expect(screen.getByText('Complete Assignment 1')).toBeInTheDocument();
      expect(screen.getByText('Study for Quiz')).toBeInTheDocument();
      expect(screen.getByText('CS101')).toBeInTheDocument();
    });
  });

  it('sorts priorities by score in descending order', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWeeklyData,
    });

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    await waitFor(() => {
      const priorityElements = screen.getAllByText(/Complete Assignment 1|Study for Quiz/);
      // Higher priority score should come first
      expect(priorityElements[0]).toHaveTextContent('Complete Assignment 1'); // Score: 85
      expect(priorityElements[1]).toHaveTextContent('Study for Quiz'); // Score: 65
    });
  });

  it('handles module click navigation', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWeeklyData,
    });

    const mockSelectModule = jest.fn();
    jest.spyOn(require('@/academic-os/context/AcademicOSContext'), 'useAcademicOS')
      .mockReturnValue({
        state: { currentWeekStart: '2024-01-01' },
        selectModule: mockSelectModule,
        openModal: jest.fn(),
      });

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    await waitFor(() => {
      const moduleCard = screen.getByText('Introduction to Computer Science');
      fireEvent.click(moduleCard);
      expect(mockSelectModule).toHaveBeenCalledWith('module-1', 'weekly');
    });
  });

  it('handles task toggle', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeeklyData,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(
      React.createElement(AcademicOSProvider, null,
        React.createElement(WeeklyViewContainer, null)
      )
    );

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(fetch).toHaveBeenCalledWith('/api/tasks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: 'task-1', completed: true }),
      });
    });
  });
});
