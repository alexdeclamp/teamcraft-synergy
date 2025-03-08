
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from './ProjectCard';

// Mock the child components
vi.mock('./ProjectCardBadge', () => ({
  default: ({ status }: { status: string }) => <div data-testid="project-badge">{status}</div>
}));

vi.mock('./ProjectCardActions', () => ({
  default: ({ id, isOwner, isFavorite, setFavorite }: { id: string, isOwner?: boolean, isFavorite: boolean, setFavorite: any }) => 
    <div data-testid="project-actions">Actions: {id}</div>
}));

vi.mock('./ProjectCardMetadata', () => ({
  default: ({ createdAt, memberCount, tags }: { createdAt: string, memberCount: number, tags?: string[] }) => 
    <div data-testid="project-metadata">Metadata: {memberCount}</div>
}));

describe('ProjectCard', () => {
  const defaultProps = {
    id: '123',
    title: 'Test Project',
    description: 'A test project description',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    status: 'active' as const,
    memberCount: 3,
    isOwner: true,
    tags: ['test', 'react'],
    isFavorite: false,
  };

  it('renders correctly with all props', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );
    
    // Check if main elements are rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
    expect(screen.getByTestId('project-badge')).toBeInTheDocument();
    expect(screen.getByTestId('project-actions')).toBeInTheDocument();
    expect(screen.getByTestId('project-metadata')).toBeInTheDocument();
    expect(screen.getByText('View brain')).toBeInTheDocument();
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      id: '123',
      title: 'Minimal Project',
      description: '',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
      status: 'active' as const,
      memberCount: 0,
    };

    render(
      <BrowserRouter>
        <ProjectCard {...minimalProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
  });
});
