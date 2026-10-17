import React, { useState } from 'react';
import { MaintenanceOperation } from '../../types';
import { maintenanceService } from '../../services/maintenanceService';
import { Wrench, ShieldAlert, Play, Clock } from 'lucide-react';

export const SystemMaintenanceView: React.FC = () => {
  const [operations, setOperations] = useState<MaintenanceOperation[]>(maintenanceService.getOperations());
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [confirmOp, setConfirmOp] = useState<MaintenanceOperation | null>(null);

  const handleStartOperation = (op: MaintenanceOperation) => {
    setConfirmOp(op);
  };

  const handleConfirmRun = async () => {
    if (!confirmOp) return;
    const targetOp = confirmOp;
    setConfirmOp(null);
    setActiveOpId(targetOp.id);

    setOperations((prev) =>
      prev.map((o) => (o.id === targetOp.id ? { ...o, status: 'running', output: undefined, error: undefined } : o))
    );

    const result = await maintenanceService.runOperation(targetOp.id);

    setOperations((prev) =>
      prev.map((o) =>
        o.id === targetOp.id
          ? {
              ...o,
              status: result.success ? 'completed' : 'failed',
              output: result.output,
              error: result.error,
            }
          : o
      )
    );
    setActiveOpId(null);
  };

  const handleCancelRunning = (opId: string) => {
    setActiveOpId(null);
    setOperations((prev) =>
      prev.map((o) => (o.id === opId ? { ...o, status: 'cancelled', output: 'Operación cancelada por el usuario.' } : o))
    );
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Wrench className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Mantenimiento del Sistema (SFC y DISM)</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Comprobación y reparación controlada de archivos e imágenes de Windows con requerimiento explícito de privilegios.
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
          Las operaciones de mantenimiento no se ejecutan automáticamente al iniciar TechKit. Se requiere confirmación explícita y privilegios de Administrador.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {operations.map((op) => {
          const isThisRunning = activeOpId === op.id;
          const isAnyRunning = activeOpId !== null;

          return (
            <div key={op.id} style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {op.name}
                    {op.requiresAdmin && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                        Requiere Administrador
                      </span>
                    )}
                  </h4>
                  <p className="text-secondary" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{op.description}</p>
                </div>

                <div>
                  {isThisRunning ? (
                    <button className="btn btn-secondary" onClick={() => handleCancelRunning(op.id)} style={{ color: '#ef4444' }}>
                      Cancelar Operación
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStartOperation(op)}
                      disabled={isAnyRunning}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Play size={14} />
                      Ejecutar
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', background: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>
                <div>
                  <span className="text-secondary" style={{ fontSize: '11px', display: 'block' }}>Objetivo</span>
                  <span style={{ fontSize: '12px' }}>{op.objective}</span>
                </div>

                <div>
                  <span className="text-secondary" style={{ fontSize: '11px', display: 'block' }}>Duración Estimada</span>
                  <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {op.estimatedDuration}
                  </span>
                </div>

                <div>
                  <span className="text-secondary" style={{ fontSize: '11px', display: 'block' }}>Estado</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: op.status === 'completed' ? '#10b981' : op.status === 'running' ? 'var(--accent-color)' : op.status === 'failed' ? '#ef4444' : 'var(--text-secondary)' }}>
                    {op.status === 'idle' && 'Pendiente'}
                    {op.status === 'running' && 'En ejecución...'}
                    {op.status === 'completed' && 'Completado'}
                    {op.status === 'failed' && 'Error'}
                    {op.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
              </div>

              {op.output && (
                <div style={{ background: '#090a0f', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--accent-color)' }}>
                  {op.output}
                </div>
              )}

              {op.error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '6px', color: '#ef4444', fontSize: '13px' }}>
                  {op.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmOp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Confirmación de Operación de Mantenimiento</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Se va a ejecutar la herramienta <strong>{confirmOp.name}</strong>.
            </p>

            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '6px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span><strong>Requisitos:</strong> {confirmOp.requirements}</span>
              <span><strong>Duración Estimada:</strong> {confirmOp.estimatedDuration}</span>
            </div>

            <p className="text-secondary" style={{ margin: 0, fontSize: '12px' }}>
              Por razones de estabilidad, asegúrese de tener permisos de administrador antes de proceder.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmOp(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmRun}>
                Confirmar y Ejecutar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
