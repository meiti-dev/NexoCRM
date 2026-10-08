import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const NexoCRM_muuwzbs7__CRM_GestorOportunidades = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const uid = MEITI.obtenerUsuarioActual();
  const tOpps = MEITI.obtenerTabla('crm_oportunidades');
  
  const vacio = { id: '', titulo: '', empresa_id: '', contacto_id: '', monto: '', etapa_id: '', probabilidad: '50', fecha_cierre: '', estado: 'abierta', notas: '' };
  const [form, setForm] = useState(vacio);
  const [oportunidades, setOportunidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const cargar = async () => {
    setCargando(true);
    const [resOpps, resEmp, resCont, resEtapas] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${tOpps}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_empresas')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_contactos')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_etapas')}?ecosistema=${eco}`)
    ]);
    if (resOpps.ok) setOportunidades(resOpps.registros || []);
    if (resEmp.ok) setEmpresas(resEmp.registros || []);
    if (resCont.ok) setContactos(resCont.registros || []);
    if (resEtapas.ok) setEtapas((resEtapas.registros || []).sort((a,b) => (a.orden||0)-(b.orden||0)));
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null); setExito(null);
    if (!form.titulo.trim() || !form.etapa_id) return setError(MEITI.t('req_opp_fields', null, 'Título y etapa son obligatorios.'));
    
    setGuardando(true);
    const payload = {
      id: form.id || 'opp_' + Date.now(),
      usuario_id: uid,
      titulo: form.titulo.trim(),
      empresa_id: form.empresa_id,
      contacto_id: form.contacto_id,
      monto: Number(form.monto) || 0,
      etapa_id: form.etapa_id,
      probabilidad: Number(form.probabilidad) || 0,
      fecha_cierre: form.fecha_cierre,
      estado: form.estado,
      notas: form.notas
    };

    await MEITI.mutar(`/api/boveda/${tOpps}?ecosistema=${eco}`, {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => { setExito(MEITI.t('opp_saved', null, 'Oportunidad guardada.')); setForm(vacio); cargar(); setGuardando(false); },
      alFallar: (err) => { setError(err || MEITI.t('err_save', null, 'Error al guardar.')); setGuardando(false); }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('del_opp_q', null, '¿Borrar esta oportunidad?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_del', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${tOpps}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, {
      alLograr: () => { setExito(MEITI.t('opp_deleted', null, 'Oportunidad borrada.')); if (form.id === id) setForm(vacio); cargar(); },
      alFallar: (err) => setError(err || MEITI.t('err_del', null, 'Error al borrar.'))
    });
  };

  const editar = (fila) => {
    setForm({ ...vacio, ...fila, monto: String(fila.monto || ''), probabilidad: String(fila.probabilidad || '') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columnas = [
    { clave: 'estado', etiqueta: '', render: (f) => <div className="w-2 h-2 rounded-sm" style={{ background: f.estado === 'ganada' ? '#10b981' : f.estado === 'perdida' ? '#ef4444' : tema.colorPrimario }}></div> },
    { clave: 'titulo', etiqueta: MEITI.t('col_title', null, 'Título') },
    { clave: 'empresa_id', etiqueta: MEITI.t('col_company', null, 'Empresa'), render: (f) => empresas.find(e => e.id === f.empresa_id)?.nombre || '--' },
    { clave: 'etapa_id', etiqueta: MEITI.t('col_stage', null, 'Etapa'), render: (f) => etapas.find(e => e.id === f.etapa_id)?.nombre || '--' },
    { clave: 'fecha_cierre', etiqueta: MEITI.t('col_close_date', null, 'Cierre'), render: (f) => <span className="font-mono text-xs">{f.fecha_cierre ? f.fecha_cierre.substring(5,10) : '--'}</span> },
    { clave: 'monto', etiqueta: MEITI.t('col_amount', null, 'Monto'), render: (f) => <span className="font-mono text-sm">${Number(f.monto).toLocaleString()}</span> }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Animacion.motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.Target size={18} color={tema.colorPrimario} />
            <UI.Etiqueta>{form.id ? MEITI.t('edit_opp', null, 'Editar Oportunidad') : MEITI.t('new_opp', null, 'Nueva Oportunidad')}</UI.Etiqueta>
          </div>
          <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
          <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />
          <form onSubmit={guardar} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_title', null, 'Título')} tipo="text" valor={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej: Venta Licencias 2026" /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_amount', null, 'Monto Estimado')} tipo="number" valor={form.monto} onChange={e => setForm({...form, monto: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_company', null, 'Empresa')} tipo="select" valor={form.empresa_id} onChange={e => setForm({...form, empresa_id: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, ...empresas.map(e => ({value: e.id, label: e.nombre}))]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_contact', null, 'Contacto')} tipo="select" valor={form.contacto_id} onChange={e => setForm({...form, contacto_id: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, ...contactos.filter(c => !form.empresa_id || c.empresa_id === form.empresa_id).map(c => ({value: c.id, label: c.nombre}))]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_stage', null, 'Etapa')} tipo="select" valor={form.etapa_id} onChange={e => setForm({...form, etapa_id: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, ...etapas.map(e => ({value: e.id, label: e.nombre}))]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_close_date', null, 'Fecha Cierre')} tipo="date" valor={form.fecha_cierre} onChange={e => setForm({...form, fecha_cierre: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_status', null, 'Estado')} tipo="select" valor={form.estado} onChange={e => setForm({...form, estado: e.target.value})} opciones={[{value:'abierta', label:'Abierta'}, {value:'ganada', label:'Ganada'}, {value:'perdida', label:'Perdida'}]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_prob', null, 'Probabilidad (%)')} tipo="number" valor={form.probabilidad} onChange={e => setForm({...form, probabilidad: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 mt-2">
              <UI.Boton tipo="submit" variante="primario" disabled={guardando}><Iconos.Save size={16} className="mr-2 inline" />{guardando ? MEITI.t('saving', null, 'Guardando...') : MEITI.t('save', null, 'Guardar')}</UI.Boton>
              {form.id && <UI.Boton tipo="button" variante="secundario" onClick={() => setForm(vacio)}><Iconos.X size={16} className="mr-2 inline" />{MEITI.t('cancel', null, 'Cancelar')}</UI.Boton>}
            </div>
          </form>
        </UI.Tarjeta>
      </Animacion.motion.div>

      <UI.Tarjeta>
        <div className="text-xs uppercase tracking-wider opacity-60 px-4 py-2" style={{ background: tema.texto + '08' }}>
          {MEITI.t('opps_list', null, 'Listado de Oportunidades')} · {oportunidades.length}
        </div>
        {cargando ? <div className="p-4 text-sm" style={{color: tema.texto}}>{MEITI.t('loading', null, 'Cargando...')}</div> : oportunidades.length === 0 ? <UI.EstadoVacio icono="fa-box-open" mensaje={MEITI.t('no_opps', null, 'No hay oportunidades registradas.')} /> : (
          <div className="[&_td]:py-2 [&_th]:py-2">
            <UI.TablaDatos columnas={columnas} datos={oportunidades} claveId="id" onEditar={editar} onBorrar={(f) => borrar(f.id)} />
          </div>
        )}
      </UI.Tarjeta>
    </div>
  );
};

export default NexoCRM_muuwzbs7__CRM_GestorOportunidades;
