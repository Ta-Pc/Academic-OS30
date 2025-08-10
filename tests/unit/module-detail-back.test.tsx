import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleDetailView } from '../../packages/ui/modules/ModuleDetail.view';

describe('ModuleDetailView back-to-week', () => {
  test('button label changes when lastViewedWeek present', () => {
    const noop = () => {};
  const { rerender } = render(React.createElement(ModuleDetailView, { header: { code: 'ABC123', title: 'Sample' }, stats: { currentObtained: 10, remainingWeight: 90, predictedSemesterMark: 50 }, assignmentsSection: React.createElement('div'), onBackToWeek: noop, hasLastViewedWeek: false }));
    expect(screen.getByTestId('back-to-week')).toHaveTextContent('Week View');
  rerender(React.createElement(ModuleDetailView, { header: { code: 'ABC123', title: 'Sample' }, stats: { currentObtained: 10, remainingWeight: 90, predictedSemesterMark: 50 }, assignmentsSection: React.createElement('div'), onBackToWeek: noop, hasLastViewedWeek: true }));
    expect(screen.getByTestId('back-to-week')).toHaveTextContent('Back to Week');
  });

  test('onBackToWeek invoked when clicked', () => {
    const spy = jest.fn();
  render(React.createElement(ModuleDetailView, { header: { code: 'ABC123', title: 'Sample' }, stats: { currentObtained: 10, remainingWeight: 90, predictedSemesterMark: 50 }, assignmentsSection: React.createElement('div'), onBackToWeek: spy, hasLastViewedWeek: true }));
    fireEvent.click(screen.getByTestId('back-to-week'));
    expect(spy).toHaveBeenCalled();
  });
});
