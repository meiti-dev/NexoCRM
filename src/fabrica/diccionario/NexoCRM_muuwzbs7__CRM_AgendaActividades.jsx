import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const NexoCRM_muuwzbs7__CRM_AgendaActividades = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [actividades, setActividades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    const [resAct, resTipos, resCont] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_tipos_actividad')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_contactos')}?ecosistema=${eco}`)
    ]);

    if (resAct.ok) setActividades(resAct.registros.filter(a => a.estado !== 'completada'));
    else setError(resAct.error || MEITI.t('err_load_activities', null, 'Error al cargar actividades'));
    
    if (resTipos.ok) setTipos(resTipos.registros);
    if (resCont.ok) setContactos(resCont.registros);
    
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    const handleUpdate = () => cargarDatos();
    window.addEventListener('crm_actividades_actualizadas', handleUpdate);
    return () => window.removeEventListener('crm_actividades_actualizadas', handleUpdate);
  }, []);

  const marcarCompletada = async (actividad) => {
    const url = `/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`;
    await MEITI.mutar(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...actividad, estado: 'completada' })
    }, {
      alLograr: () => {
        cargarDatos();
        window.dispatchEvent(new Event('crm_actividades_actualizadas'));
      },
      alFallar: (err) => setError(err || MEITI.t('err_complete', null, 'Error al completar'))
    });
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const atrasadas = [];
  const paraHoy = [];
  const proximas = [];

  actividades.forEach(act => {
    if (!act.fecha_vencimiento) {
      proximas.push(act);
      return;
    }
    const fechaAct = new Date(act.fecha_vencimiento);
    fechaAct.setHours(0, 0, 0, 0);
    
    if (fechaAct < hoy) atrasadas.push(act);
    else if (fechaAct.getTime() === hoy.getTime()) paraHoy.push(act);
    else proximas.push(act);
  });

  const TarjetaActividad = ({ act, colorBorde }) => {
    const tipo = tipos.find(t => t.id === act.tipo_id) || {};
    const contacto = contactos.find(c => c.id === act.contacto_id);
    
    return (
      <Animacion.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl border flex flex-col gap-2 shadow-sm" style={{ backgroundColor: tema.fondo, borderColor: colorBorde }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tema.superficie, color: tema.texto }}>
              <i className={`fa-solid ${tipo.icono || 'fa-thumbtack'}`}></i>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight" style={{ color: tema.texto }}>{act.titulo}</h4>
              <span className="text-xs opacity-70" style={{ color: tema.texto }}>{tipo.nombre || MEITI.t('task', null, 'Tarea')}</span>
            </div>
          </div>
          <button onClick={() => marcarCompletada(act)} className="p-1.5 rounded-full hover:bg-black/5 transition-colors" title={MEITI.t('mark_done', null, 'Marcar completada')}>
            <Iconos.CircleCheck size={20} color={tema.colorSecundario} />
          </button>
        </div>
        {contacto && (
          <div className="flex items-center gap-2 text-xs opacity-80 mt-1" style={{ color: tema.texto }}>
            <Iconos.User size={12} />
            <span className="truncate">{contacto.nombre}</span>
          </div>
        )}
        {act.fecha_vencimiento && (
          <div className="flex items-center gap-2 text-xs opacity-80" style={{ color: tema.texto }}>
            <Iconos.Calendar size={12} />
            <span>{new Date(act.fecha_vencimiento).toLocaleDateString()}</span>
          </div>
        )}
      </Animacion.motion.div>
    );
  };

  return (
    <UI.Tarjeta className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Iconos.CalendarClock size={24} color={tema.colorPrimario} />
        <h2 className="text-xl font-bold" style={{ color: tema.texto }}>{MEITI.t('agenda_title', null, 'Mi Agenda')}</h2>
      </div>
      
      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />

      {cargando ? (
        <div className="p-8 text-center"><Iconos.Loader className="animate-spin mx-auto" size={24} color={tema.colorPrimario} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <UI.Etiqueta>{MEITI.t('overdue', null, 'Atrasadas')}</UI.Etiqueta>
              <UI.Chip tono="peligro">{atrasadas.length}</UI.Chip>
            </div>
            <div className="flex flex-col gap-3">
              {atrasadas.length === 0 ? (
                <p className="text-sm opacity-50 italic" style={{ color: tema.texto }}>{MEITI.t('no_overdue', null, 'Nada atrasado')}</p>
              ) : (
                atrasadas.map(act => <TarjetaActividad key={act.id} act={act} colorBorde="#ef444455" />)
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <UI.Etiqueta>{MEITI.t('today', null, 'Para Hoy')}</UI.Etiqueta>
              <UI.Chip tono="alerta">{paraHoy.length}</UI.Chip>
            </div>
            <div className="flex flex-col gap-3">
              {paraHoy.length === 0 ? (
                <p className="text-sm opacity-50 italic" style={{ color: tema.texto }}>{MEITI.t('no_today', null, 'Día libre')}</p>
              ) : (
                paraHoy.map(act => <TarjetaActividad key={act.id} act={act} colorBorde="#f59e0b55" />)
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <UI.Etiqueta>{MEITI.t('upcoming', null, 'Próximas')}</UI.Etiqueta>
              <UI.Chip tono="neutro">{proximas.length}</UI.Chip>
            </div>
            <div className="flex flex-col gap-3">
              {proximas.length === 0 ? (
                <p className="text-sm opacity-50 italic" style={{ color: tema.texto }}>{MEITI.t('no_upcoming', null, 'Sin próximas tareas')}</p>
              ) : (
                proximas.map(act => <TarjetaActividad key={act.id} act={act} colorBorde={tema.colorPrimario + '55'} />)
              )}
            </div>
          </div>
        </div>
      )}
    </UI.Tarjeta>
  );
};

export default NexoCRM_muuwzbs7__CRM_AgendaActividades;
