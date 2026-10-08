import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const NexoCRM_muuwzbs7__CRM_DashboardResumen = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [oportunidades, setOportunidades] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const [resOpps, resActs] = await Promise.all([
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_oportunidades')}?ecosistema=${eco}`),
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`)
      ]);
      if (resOpps.ok) setOportunidades(resOpps.registros || []);
      if (resActs.ok) setActividades(resActs.registros || []);
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando) return <UI.Tarjeta><div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto" size={32} color={tema.colorPrimario} /></div></UI.Tarjeta>;

  const abiertas = oportunidades.filter(o => o.estado === 'abierta');
  const ganadas = oportunidades.filter(o => o.estado === 'ganada');
  const montoAbierto = abiertas.reduce((acc, o) => acc + (Number(o.monto) || 0), 0);
  const montoGanado = ganadas.reduce((acc, o) => acc + (Number(o.monto) || 0), 0);
  
  const hoy = new Date().toISOString().split('T')[0];
  const actsVencidas = actividades.filter(a => a.estado === 'pendiente' && a.fecha_vencimiento < hoy).length;

  const datosGrafico = abiertas.reduce((acc, o) => {
    const etapa = o.etapa_id || 'Sin etapa';
    const existente = acc.find(x => x.etapa === etapa);
    if (existente) existente.monto += (Number(o.monto) || 0);
    else acc.push({ etapa, monto: Number(o.monto) || 0 });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <UI.Tarjeta className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: tema.colorPrimario + '22', color: tema.colorPrimario }}>
              <Iconos.Target size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold opacity-60" style={{ color: tema.texto }}>{MEITI.t('funnel_value', null, 'Valor del Embudo')}</p>
              <p className="text-xl font-mono font-bold" style={{ color: tema.texto }}>${montoAbierto.toLocaleString()}</p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>
        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
          <UI.Tarjeta className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: tema.colorSecundario + '22', color: tema.colorSecundario }}>
              <Iconos.Trophy size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold opacity-60" style={{ color: tema.texto }}>{MEITI.t('won_deals', null, 'Ventas Ganadas')}</p>
              <p className="text-xl font-mono font-bold" style={{ color: tema.texto }}>${montoGanado.toLocaleString()}</p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>
        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }}>
          <UI.Tarjeta className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#ef444422', color: '#ef4444' }}>
              <Iconos.AlarmClock size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold opacity-60" style={{ color: tema.texto }}>{MEITI.t('overdue_acts', null, 'Actividades Vencidas')}</p>
              <p className="text-xl font-mono font-bold" style={{ color: tema.texto }}>{actsVencidas}</p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>
      </div>

      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.ChartColumn size={18} color={tema.colorPrimario} />
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: tema.texto }}>{MEITI.t('pipeline_chart', null, 'Pipeline por Etapa')}</h3>
          </div>
          {datosGrafico.length === 0 ? (
            <UI.EstadoVacio icono="fa-chart-simple" mensaje={MEITI.t('no_data_chart', null, 'No hay oportunidades abiertas para graficar.')} />
          ) : (
            <div className="w-full h-64">
              <Graficos.ResponsiveContainer width="100%" height="100%">
                <Graficos.BarChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <Graficos.CartesianGrid strokeDasharray="3 3" stroke={tema.texto + '22'} vertical={false} />
                  <Graficos.XAxis dataKey="etapa" stroke={tema.texto} fontSize={12} tickLine={false} axisLine={false} />
                  <Graficos.YAxis stroke={tema.texto} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Graficos.Tooltip cursor={{fill: tema.texto + '11'}} contentStyle={{ backgroundColor: tema.superficie, borderColor: tema.colorPrimario + '33', borderRadius: '8px', color: tema.texto }} />
                  <Graficos.Bar dataKey="monto" fill={tema.colorPrimario} radius={[4, 4, 0, 0]} />
                </Graficos.BarChart>
              </Graficos.ResponsiveContainer>
            </div>
          )}
        </UI.Tarjeta>
      </Animacion.motion.div>
    </div>
  );
};

export default NexoCRM_muuwzbs7__CRM_DashboardResumen;
