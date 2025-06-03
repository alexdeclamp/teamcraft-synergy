import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCardActions } from './ProjectCardActions';

describe('ProjectCardActions', () => {
  const mockProject = {
    id: '123',
    title: 'Test Project',
    description: 'A test project',
    owner_id: 'user123',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    is_favorite: false,
    is_archived: false,
  };

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleFavorite = jest.fn();
  const mockOnArchive = jest.fn();

  it('renders without errors', () => {
    render(
      <ProjectCardActions
        project={mockProject}
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFavorite={mockOnToggleFavorite}
        onArchive={mockOnArchive}
      />
    );
    expect(screen.getByRole('button', { name: 'Edit project' })).toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', () => {
    render(
      <ProjectCardActions
        project={mockProject}
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFavorite={mockOnToggleFavorite}
        onArchive={mockOnArchive}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit project' }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject);
  });

  it('calls onDelete when the delete button is clicked', () => {
    render(
      <ProjectCardActions
        project={mockProject}
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFavorite={mockOnToggleFavorite}
        onArchive={mockOnArchive}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject.id);
  });

  it('calls onToggleFavorite when the favorite button is clicked', () => {
    render(
      <ProjectCardActions
        project={mockProject}
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFavorite={mockOnToggleFavorite}
        onArchive={mockOnArchive}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockProject.id, !mockProject.is_favorite);
  });

  it('calls onArchive when the archive button is clicked', () => {
    render(
      <ProjectCardActions
        project={mockProject}
        user={mockUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFavorite={mockOnToggleFavorite}
        onArchive={mockOnArchive}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Archive project' }));
    expect(mockOnArchive).toHaveBeenCalledWith(mockProject.id, !mockProject.is_archived);
  });
});
