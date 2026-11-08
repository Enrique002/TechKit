import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProcessesView } from '../src/components/views/ProcessesView';

describe('ProcessesView Component - Performance & Filtering', () => {
  it('renders process list successfully with mock processes', async () => {
    render(<ProcessesView />);

    await waitFor(() => {
      expect(screen.getByText('msedge.exe')).toBeInTheDocument();
      expect(screen.getByText('Code.exe')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('filters processes dynamically by search term without breaking rendering', async () => {
    render(<ProcessesView />);

    await waitFor(() => {
      expect(screen.getByText('msedge.exe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por Nombre, PID, Usuario/i);
    fireEvent.change(searchInput, { target: { value: 'Code' } });

    await waitFor(() => {
      expect(screen.getByText('Code.exe')).toBeInTheDocument();
      expect(screen.queryByText('msedge.exe')).not.toBeInTheDocument();
    });
  });

  it('filters processes by category button (Del Sistema / De Usuario)', async () => {
    render(<ProcessesView />);

    await waitFor(() => {
      expect(screen.getByText('msedge.exe')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    const systemFilterBtn = screen.getByText('Del Sistema');
    fireEvent.click(systemFilterBtn);

    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.queryByText('msedge.exe')).not.toBeInTheDocument();
    });
  });
});
