
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCardBadge from './ProjectCardBadge';

describe('ProjectCardBadge', () => {
  it('renders active status correctly', () => {
    render(<ProjectCardBadge status="active" />);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('renders archived status correctly', () => {
    render(<ProjectCardBadge status="archived" />);
    const badge = screen.getByText('Archived');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('renders completed status correctly', () => {
    render(<ProjectCardBadge status="completed" />);
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });
});
