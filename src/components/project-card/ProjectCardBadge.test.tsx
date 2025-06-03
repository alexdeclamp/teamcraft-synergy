import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCardBadge } from './ProjectCardBadge';

describe('ProjectCardBadge', () => {
  it('renders the badge with the correct text', () => {
    const text = 'In Progress';
    render(<ProjectCardBadge text={text} />);
    const badgeElement = screen.getByText(text);
    expect(badgeElement).toBeInTheDocument();
  });

  it('applies the correct styling based on the text', () => {
    const text = 'Completed';
    render(<ProjectCardBadge text={text} />);
    const badgeElement = screen.getByText(text);
    expect(badgeElement).toHaveClass('bg-green-100');
  });
});
