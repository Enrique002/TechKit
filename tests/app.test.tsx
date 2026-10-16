import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../src/App';

describe('TechKit App Integration Phase 2', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Phase 2 functional views in Hardware category', () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const hwButton = buttons.find((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Hardware y temperaturas'));
    expect(hwButton).toBeDefined();
    if (hwButton) fireEvent.click(hwButton);

    expect(screen.getByText('Procesador (CPU)')).toBeInTheDocument();
    expect(screen.getByText('Memoria RAM')).toBeInTheDocument();
  });

  it('renders Phase 2 functional view in Storage category', () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const storageButtons = buttons.filter((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Discos y almacenamiento'));
    expect(storageButtons.length).toBeGreaterThan(0);
    fireEvent.click(storageButtons[0]);

    const storageTitles = screen.getAllByText('Unidades y Almacenamiento');
    expect(storageTitles.length).toBeGreaterThan(0);
  });

  it('renders Phase 2 system summary in OS category', () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const osButton = buttons.find((btn) => btn.className.includes('nav-item') && btn.textContent?.includes('Sistema operativo'));
    expect(osButton).toBeDefined();
    if (osButton) fireEvent.click(osButton);

    expect(screen.getByText('Resumen General del Equipo')).toBeInTheDocument();
  });
});
