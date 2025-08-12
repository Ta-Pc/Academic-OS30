'use client';
// AcademicOS Flow Composition
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { CurrentUser } from '@/lib/user-store';
import { useWeekStore } from '@/lib/week-store';

/**
 * Academic OS view types for navigation.
 */
export type AcademicOSView = 'weekly' | 'modules' | 'module' | 'strategic' | 'whatif' | 'settings';

/**
 * Modal state for overlays.
 */
export type AcademicOSModal = 'add-task' | 'add-module' | 'onboarding' | null;

/**
 * Academic OS application state.
 */
export interface AcademicOSState {
  // Navigation state
  currentView: AcademicOSView;
  selectedModuleId: string | null;
  
  // Week context
  currentWeekStart: string | null; // ISO date string
  
  // Modal state
  activeModal: AcademicOSModal;
  
  // First-run experience
  hasSeenOnboarding: boolean;
  
  // Navigation history for back actions
  navigationStack: Array<{ view: AcademicOSView; moduleId?: string; weekStart?: string }>;
}

/**
 * Academic OS actions for state updates.
 */
export type AcademicOSAction =
  | { type: 'SET_VIEW'; view: AcademicOSView }
  | { type: 'SELECT_MODULE'; moduleId: string; originView?: AcademicOSView }
  | { type: 'SET_WEEK'; weekStart: string }
  | { type: 'NEXT_WEEK' }
  | { type: 'PREV_WEEK' }
  | { type: 'RESET_WEEK' }
  | { type: 'OPEN_MODAL'; modal: AcademicOSModal }
  | { type: 'CLOSE_MODAL' }
  | { type: 'MARK_ONBOARDING_SEEN' }
  | { type: 'GO_BACK' }
  | { type: 'RESET_NAVIGATION' };

/**
 * Academic OS context interface.
 */
export interface AcademicOSContextType {
  state: AcademicOSState;
  
  // Navigation actions
  setView: (view: AcademicOSView) => void;
  selectModule: (moduleId: string, originView?: AcademicOSView) => void;
  goBack: () => void;
  
  // Week navigation
  setWeek: (weekStart: string) => void;
  nextWeek: () => void;
  prevWeek: () => void;
  resetWeek: () => void;
  
  // Modal actions
  openModal: (modal: AcademicOSModal) => void;
  closeModal: () => void;
  
  // Onboarding
  markOnboardingSeen: () => void;
  
  // Utilities
  isFirstVisit: boolean;
  currentUser: CurrentUser;
}

// Initial state - start with strategic view since this is now the main dashboard
const initialState: AcademicOSState = {
  currentView: 'strategic',
  selectedModuleId: null,
  currentWeekStart: null, // Will be set on mount
  activeModal: null,
  hasSeenOnboarding: false,
  navigationStack: [],
};

// State reducer
function academicOSReducer(state: AcademicOSState, action: AcademicOSAction): AcademicOSState {
  switch (action.type) {
    case 'SET_VIEW': {
      // Clear selected module when switching views (except to module view)
      const clearedModuleId = action.view === 'module' ? state.selectedModuleId : null;
      
      // Add current view to navigation stack if switching away from it
      const newStack = state.currentView !== action.view 
        ? [...state.navigationStack, { 
            view: state.currentView, 
            moduleId: state.selectedModuleId || undefined,
            weekStart: state.currentWeekStart || undefined 
          }]
        : state.navigationStack;
      
      return {
        ...state,
        currentView: action.view,
        selectedModuleId: clearedModuleId,
        navigationStack: newStack,
      };
    }

    case 'SELECT_MODULE': {
      // Add origin view to navigation stack if provided
      const moduleStack = action.originView
        ? [...state.navigationStack, { 
            view: action.originView,
            weekStart: state.currentWeekStart || undefined 
          }]
        : state.navigationStack;
      
      return {
        ...state,
        currentView: 'module',
        selectedModuleId: action.moduleId,
        navigationStack: moduleStack,
      };
    }

    case 'SET_WEEK': {
      return {
        ...state,
        currentWeekStart: action.weekStart,
      };
    }

    case 'NEXT_WEEK': {
      if (!state.currentWeekStart) return state;
      
      const currentWeek = new Date(state.currentWeekStart);
      const nextWeek = new Date(currentWeek);
      nextWeek.setDate(currentWeek.getDate() + 7);
      
      return {
        ...state,
        currentWeekStart: nextWeek.toISOString().split('T')[0],
      };
    }

    case 'PREV_WEEK': {
      if (!state.currentWeekStart) return state;
      
      const prevWeekDate = new Date(state.currentWeekStart);
      prevWeekDate.setDate(prevWeekDate.getDate() - 7);
      
      return {
        ...state,
        currentWeekStart: prevWeekDate.toISOString().split('T')[0],
      };
    }

    case 'RESET_WEEK': {
      const today = new Date();
      return {
        ...state,
        currentWeekStart: today.toISOString().split('T')[0],
      };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        activeModal: action.modal,
      };
    }

    case 'CLOSE_MODAL': {
      return {
        ...state,
        activeModal: null,
      };
    }

    case 'MARK_ONBOARDING_SEEN': {
      return {
        ...state,
        hasSeenOnboarding: true,
      };
    }

    case 'GO_BACK': {
      if (state.navigationStack.length === 0) {
        // Default back to weekly view
        return {
          ...state,
          currentView: 'weekly',
          selectedModuleId: null,
        };
      }
      
      const previousView = state.navigationStack[state.navigationStack.length - 1];
      const newNavStack = state.navigationStack.slice(0, -1);
      
      return {
        ...state,
        currentView: previousView.view,
        selectedModuleId: previousView.moduleId || null,
        currentWeekStart: previousView.weekStart || state.currentWeekStart,
        navigationStack: newNavStack,
      };
    }

    case 'RESET_NAVIGATION': {
      return {
        ...state,
        navigationStack: [],
      };
    }

    default:
      return state;
  }
}

// Context creation
const AcademicOSContext = createContext<AcademicOSContextType | null>(null);

/**
 * Academic OS Context Provider - orchestrates the entire application state.
 */
export function AcademicOSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(academicOSReducer, initialState);
  const currentUser: CurrentUser = null;
  const { lastViewedWeek } = useWeekStore();

  // Initialize week start on mount
  useEffect(() => {
    const initialWeek = lastViewedWeek || new Date().toISOString().split('T')[0];
    dispatch({ type: 'SET_WEEK', weekStart: initialWeek });
  }, [lastViewedWeek]);

  // Sync with week store when currentWeekStart changes
  useEffect(() => {
    if (state.currentWeekStart) {
      useWeekStore.getState().setLastViewedWeek(state.currentWeekStart);
    }
  }, [state.currentWeekStart]);

  // Check for first visit (could be enhanced with localStorage)
  const isFirstVisit = false;

  // Action creators
  const setView = useCallback((view: AcademicOSView) => {
    dispatch({ type: 'SET_VIEW', view });
  }, []);

  const selectModule = useCallback((moduleId: string, originView?: AcademicOSView) => {
    // Handle special case for creating new module
    if (moduleId === 'new') {
      dispatch({ type: 'OPEN_MODAL', modal: 'add-module' });
      return;
    }
    dispatch({ type: 'SELECT_MODULE', moduleId, originView });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const setWeek = useCallback((weekStart: string) => {
    dispatch({ type: 'SET_WEEK', weekStart });
  }, []);

  const nextWeek = useCallback(() => {
    dispatch({ type: 'NEXT_WEEK' });
  }, []);

  const prevWeek = useCallback(() => {
    dispatch({ type: 'PREV_WEEK' });
  }, []);

  const resetWeek = useCallback(() => {
    dispatch({ type: 'RESET_WEEK' });
  }, []);

  const openModal = useCallback((modal: AcademicOSModal) => {
    dispatch({ type: 'OPEN_MODAL', modal });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const markOnboardingSeen = useCallback(() => {
    dispatch({ type: 'MARK_ONBOARDING_SEEN' });
  }, []);

  const contextValue: AcademicOSContextType = {
    state,
    setView,
    selectModule,
    goBack,
    setWeek,
    nextWeek,
    prevWeek,
    resetWeek,
    openModal,
    closeModal,
    markOnboardingSeen,
    isFirstVisit,
    currentUser,
  };

  return (
    <AcademicOSContext.Provider value={contextValue}>
      {children}
    </AcademicOSContext.Provider>
  );
}

/**
 * Hook to access Academic OS context.
 */
export function useAcademicOS(): AcademicOSContextType {
  const context = useContext(AcademicOSContext);
  if (!context) {
    throw new Error('useAcademicOS must be used within AcademicOSProvider');
  }
  return context;
}
