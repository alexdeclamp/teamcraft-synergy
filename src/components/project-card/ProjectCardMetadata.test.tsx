
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCardMetadata from './ProjectCardMetadata';

describe('ProjectCardMetadata', () => {
  it('renders the created date correctly', () => {
    const date = '2023-01-15T12:00:00Z';
    render(<ProjectCardMetadata createdAt={date} memberCount={3} />);
    
    // Check if the date is formatted and displayed correctly
    // Note: exact formatting might vary based on locale
    expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
  });

  it('displays singular member text when count is 1', () => {
    render(<ProjectCardMetadata createdAt="2023-01-01" memberCount={1} />);
    expect(screen.getByText(/1 member/)).toBeInTheDocument();
    expect(screen.queryByText(/members/)).not.toBeInTheDocument();
  });

  it('displays plural members text when count is not 1', () => {
    render(<ProjectCardMetadata createdAt="2023-01-01" memberCount={5} />);
    expect(screen.getByText(/5 members/)).toBeInTheDocument();
  });

  it('displays tags when provided', () => {
    const tags = ['React', 'TypeScript', 'Testing'];
    render(<ProjectCardMetadata createdAt="2023-01-01" memberCount={3} tags={tags} />);
    
    tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('does not display tags section when no tags are provided', () => {
    render(<ProjectCardMetadata createdAt="2023-01-01" memberCount={3} />);
    
    // Check that the Tag icon is not present when no tags are provided
    const tagIcon = screen.queryByTestId('tag-icon');
    expect(tagIcon).not.toBeInTheDocument();
  });
});
