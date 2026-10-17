import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../src/App';

describe('TechKit App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders functional views in Hardware category', async () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const hwButton = buttons.find((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Sistema y Hardware'));
    expect(hwButton).toBeDefined();
    if (hwButton) fireEvent.click(hwButton);

    await waitFor(() => {
      expect(screen.getByText('Procesador (CPU)')).toBeInTheDocument();
      expect(screen.getByText('Memoria RAM')).toBeInTheDocument();
    });
  });

  it('renders functional view in Storage category', async () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const storageButtons = buttons.filter((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Discos y Almacenamiento'));
    expect(storageButtons.length).toBeGreaterThan(0);
    fireEvent.click(storageButtons[0]);

    await waitFor(() => {
      const storageTitles = screen.getAllByText('Unidades y Almacenamiento');
      expect(storageTitles.length).toBeGreaterThan(0);
    });
  });

  it('renders system summary in OS category', async () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const osButton = buttons.find((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Especificaciones del Equipo'));
    expect(osButton).toBeDefined();
    if (osButton) fireEvent.click(osButton);

    await waitFor(() => {
      expect(screen.getByText('Especificaciones Completas del Equipo')).toBeInTheDocument();
    });
  });
});
