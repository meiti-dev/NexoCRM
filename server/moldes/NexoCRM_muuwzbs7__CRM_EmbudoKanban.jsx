/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [oportunidades, setOportunidades] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    const [resOpps, resEtapas, resEmp] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_oportunidades')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_etapas')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_empresas')}?ecosistema=${eco}`)
    ]);
    if (resOpps.ok) setOportunidades(resOpps.registros.filter(o => o.estado === 'abierta'));
    if (resEtapas.ok) setEtapas((resEtapas.registros || []).sort((a, b) => (a.orden || 0) - (b.orden || 0)));
    if (resEmp.ok) setEmpresas(resEmp.registros || []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const moverOportunidad = async (opp, nuevaEtapaId) => {
    const url = `/api/boveda/${MEITI.obtenerTabla('crm_oportunidades')}?ecosistema=${eco}`;
    await MEITI.mutar(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...opp, etapa_id: nuevaEtapaId })
    }, {
      alLograr: cargar,
      alFallar: setError
    });
  };

  if (cargando) return <UI.Tarjeta><div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto" size={32} color={tema.colorPrimario} /></div></UI.Tarjeta>;
  if (etapas.length === 0) return <UI.Tarjeta><UI.EstadoVacio icono="fa-layer-group" mensaje={MEITI.t('no_stages', null, 'No hay etapas configuradas. Créalas en Catálogos.')} /></UI.Tarjeta>;

  return (
    <div className="flex flex-col gap-4 h-full">
      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
        {etapas.map((etapa, index) => {
          const oppsEtapa = oportunidades.filter(o => o.etapa_id === etapa.id);
          const totalEtapa = oppsEtapa.reduce((acc, o) => acc + (Number(o.monto) || 0), 0);
          return (
            <div key={etapa.id} className="flex flex-col gap-3 min-w-[280px] w-[280px] shrink-0">
              <div className="px-3 py-2 rounded-lg flex justify-between items-center" style={{ background: (etapa.color || tema.colorPrimario) + '22', borderTop: `3px solid ${etapa.color || tema.colorPrimario}` }}>
                <span className="font-bold text-sm uppercase tracking-wider" style={{ color: tema.texto }}>{etapa.nombre}</span>
                <span className="font-mono text-xs font-bold" style={{ color: tema.texto }}>${totalEtapa.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Animacion.AnimatePresence>
                  {oppsEtapa.map(opp => {
                    const empresa = empresas.find(e => e.id === opp.empresa_id);
                    return (
                      <Animacion.motion.div key={opp.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                        <div className="p-3 rounded-xl shadow-sm border flex flex-col gap-2" style={{ background: tema.superficie, borderColor: tema.texto + '11' }}>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm leading-tight" style={{ color: tema.texto }}>{opp.titulo}</span>
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: tema.fondo, color: tema.colorSecundario }}>${Number(opp.monto).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-70">
                            <Iconos.Building2 size={12} color={tema.texto} />
                            <span className="text-xs truncate" style={{ color: tema.texto }}>{empresa ? empresa.nombre : 'Sin empresa'}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t" style={{ borderColor: tema.texto + '11' }}>
                            <button onClick={() => moverOportunidad(opp, etapas[index - 1].id)} disabled={index === 0} className="p-1 rounded hover:bg-black/5 disabled:opacity-20 transition-colors">
                              <Iconos.ChevronLeft size={16} color={tema.texto} />
                            </button>
                            <span className="text-[10px] uppercase font-bold opacity-50" style={{ color: tema.texto }}>{opp.fecha_cierre ? opp.fecha_cierre.substring(5,10) : '--/--'}</span>
                            <button onClick={() => moverOportunidad(opp, etapas[index + 1].id)} disabled={index === etapas.length - 1} className="p-1 rounded hover:bg-black/5 disabled:opacity-20 transition-colors">
                              <Iconos.ChevronRight size={16} color={tema.texto} />
                            </button>
                          </div>
                        </div>
                      </Animacion.motion.div>
                    );
                  })}
                </Animacion.AnimatePresence>
                {oppsEtapa.length === 0 && (
                  <div className="p-4 text-center border border-dashed rounded-xl opacity-40" style={{ borderColor: tema.texto, color: tema.texto }}>
                    <span className="text-xs">{MEITI.t('empty_stage', null, 'Vacío')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}