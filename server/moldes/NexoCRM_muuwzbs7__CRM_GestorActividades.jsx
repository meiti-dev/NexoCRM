/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();
  
  const [actividades, setActividades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const vacio = { id: '', titulo: '', tipo_id: '', contacto_id: '', oportunidad_id: '', fecha_vencimiento: '', estado: 'pendiente', descripcion: '' };
  const [form, setForm] = useState(vacio);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');

  const cargarDatos = async () => {
    setCargando(true);
    const [resAct, resTipos, resCont, resOport] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_tipos_actividad')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_contactos')}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_oportunidades')}?ecosistema=${eco}`)
    ]);

    if (resAct.ok) setActividades(resAct.registros);
    if (resTipos.ok) setTipos(resTipos.registros);
    if (resCont.ok) setContactos(resCont.registros);
    if (resOport.ok) setOportunidades(resOport.registros);
    
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    const handleUpdate = () => cargarDatos();
    window.addEventListener('crm_actividades_actualizadas', handleUpdate);
    return () => window.removeEventListener('crm_actividades_actualizadas', handleUpdate);
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!form.titulo.trim() || !form.tipo_id) {
      return setError(MEITI.t('req_fields_act', null, 'El título y el tipo son obligatorios.'));
    }

    setGuardando(true);
    const esNuevo = !form.id;
    const payload = {
      id: esNuevo ? 'act_' + Date.now() : form.id,
      usuario_id: miId,
      titulo: form.titulo.trim(),
      tipo_id: form.tipo_id,
      contacto_id: form.contacto_id || null,
      oportunidad_id: form.oportunidad_id || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      estado: form.estado,
      descripcion: form.descripcion.trim(),
      fecha_registro: esNuevo ? new Date().toISOString() : undefined
    };

    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`, {
      method: esNuevo ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => {
        setExito(MEITI.t('act_saved', null, 'Actividad guardada.'));
        setForm(vacio);
        cargarDatos();
        window.dispatchEvent(new Event('crm_actividades_actualizadas'));
        setGuardando(false);
      },
      alFallar: (err) => {
        setError(err || MEITI.t('act_save_err', null, 'Error al guardar.'));
        setGuardando(false);
      }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('del_act_q', null, '¿Borrar esta actividad?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_delete', null, 'Sí, borrar'), tono: 'peligro' })) return;
    
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}&id=${id}`, {
      method: 'DELETE'
    }, {
      alLograr: () => {
        setExito(MEITI.t('act_deleted', null, 'Actividad eliminada.'));
        if (form.id === id) setForm(vacio);
        cargarDatos();
        window.dispatchEvent(new Event('crm_actividades_actualizadas'));
      },
      alFallar: (err) => setError(err || MEITI.t('act_del_err', null, 'Error al eliminar.'))
    });
  };

  const editar = (fila) => {
    setForm({
      id: fila.id,
      titulo: fila.titulo || '',
      tipo_id: fila.tipo_id || '',
      contacto_id: fila.contacto_id || '',
      oportunidad_id: fila.oportunidad_id || '',
      fecha_vencimiento: fila.fecha_vencimiento ? fila.fecha_vencimiento.split('T')[0] : '',
      estado: fila.estado || 'pendiente',
      descripcion: fila.descripcion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const alternarEstado = async (fila) => {
    const nuevoEstado = fila.estado === 'completada' ? 'pendiente' : 'completada';
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('crm_actividades')}?ecosistema=${eco}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fila, estado: nuevoEstado })
    }, {
      alLograr: () => {
        cargarDatos();
        window.dispatchEvent(new Event('crm_actividades_actualizadas'));
      },
      alFallar: (err) => setError(err || MEITI.t('err_status', null, 'Error al cambiar estado.'))
    });
  };

  const columnas = [
    { clave: 'titulo', etiqueta: MEITI.t('col_title', null, 'Título'), render: f => <span className="font-bold">{f.titulo}</span> },
    { clave: 'tipo_id', etiqueta: MEITI.t('col_type', null, 'Tipo'), render: f => tipos.find(t => t.id === f.tipo_id)?.nombre || '---' },
    { clave: 'contacto_id', etiqueta: MEITI.t('col_contact', null, 'Contacto'), render: f => contactos.find(c => c.id === f.contacto_id)?.nombre || '---' },
    { clave: 'fecha_vencimiento', etiqueta: MEITI.t('col_due', null, 'Vencimiento'), tipo: 'fecha' },
    { clave: 'estado', etiqueta: MEITI.t('col_status', null, 'Estado'), render: f => <UI.Chip tono={f.estado === 'completada' ? 'exito' : 'alerta'}>{f.estado === 'completada' ? MEITI.t('st_done', null, 'Completada') : MEITI.t('st_pend', null, 'Pendiente')}</UI.Chip> }
  ];

  const accionesExtra = [
    {
      etiqueta: (f) => f.estado === 'completada' ? MEITI.t('mark_pend', null, 'Marcar Pendiente') : MEITI.t('mark_done', null, 'Marcar Completada'),
      icono: 'fa-check',
      tono: 'exito',
      onClick: alternarEstado
    }
  ];

  const actsFiltradas = actividades.filter(a => filtroEstado === 'todas' || a.estado === filtroEstado).sort((a, b) => new Date(a.fecha_vencimiento || '2099') - new Date(b.fecha_vencimiento || '2099'));

  return (
    <div className="flex flex-col gap-6">
      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.ListTodo size={20} color={tema.colorPrimario} />
            <UI.Etiqueta>{form.id ? MEITI.t('edit_act', null, 'Editar Actividad') : MEITI.t('new_act', null, 'Nueva Actividad')}</UI.Etiqueta>
          </div>
          
          <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
          <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />

          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_title', null, 'Título / Asunto')} tipo="text" valor={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder={MEITI.t('ph_title', null, 'Ej: Llamada de seguimiento')} />
              </div>
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_type', null, 'Tipo de Actividad')} tipo="select" valor={form.tipo_id} onChange={e => setForm({...form, tipo_id: e.target.value})} opciones={[{value:'', label: MEITI.t('ph_select', null, 'Seleccionar...')}, ...tipos.map(t => ({ value: t.id, label: t.nombre }))]} />
              </div>
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_contact', null, 'Contacto Relacionado')} tipo="select" valor={form.contacto_id} onChange={e => setForm({...form, contacto_id: e.target.value})} opciones={[{value:'', label: MEITI.t('ph_none', null, 'Ninguno')}, ...contactos.map(c => ({ value: c.id, label: c.nombre }))]} />
              </div>
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_opp', null, 'Oportunidad Relacionada')} tipo="select" valor={form.oportunidad_id} onChange={e => setForm({...form, oportunidad_id: e.target.value})} opciones={[{value:'', label: MEITI.t('ph_none', null, 'Ninguna')}, ...oportunidades.map(o => ({ value: o.id, label: o.titulo }))]} />
              </div>
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_due', null, 'Fecha de Vencimiento')} tipo="date" valor={form.fecha_vencimiento} onChange={e => setForm({...form, fecha_vencimiento: e.target.value})} />
              </div>
              <div className="flex-1">
                <UI.Campo etiqueta={MEITI.t('f_status', null, 'Estado')} tipo="select" valor={form.estado} onChange={e => setForm({...form, estado: e.target.value})} opciones={[{value:'pendiente', label: MEITI.t('st_pend', null, 'Pendiente')}, {value:'completada', label: MEITI.t('st_done', null, 'Completada')}]} />
              </div>
              <div className="md:col-span-2 flex-1">
                <UI.Campo etiqueta={MEITI.t('f_desc', null, 'Descripción / Notas')} tipo="textarea" valor={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder={MEITI.t('ph_desc_act', null, 'Detalles de la reunión, puntos a tratar...')} />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <UI.Boton tipo="submit" variante="primario" disabled={guardando}>
                <span className="flex items-center gap-2"><Iconos.Save size={16} /> {guardando ? MEITI.t('saving', null, 'Guardando...') : (form.id ? MEITI.t('btn_update', null, 'Actualizar') : MEITI.t('btn_create', null, 'Crear Actividad'))}</span>
              </UI.Boton>
              {form.id && (
                <UI.Boton tipo="button" variante="secundario" onClick={() => setForm(vacio)}>
                  <span className="flex items-center gap-2"><Iconos.X size={16} /> {MEITI.t('btn_cancel', null, 'Cancelar')}</span>
                </UI.Boton>
              )}
            </div>
          </form>
        </UI.Tarjeta>
      </Animacion.motion.div>

      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <UI.Tarjeta className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Iconos.List size={20} color={tema.colorSecundario} />
              <UI.Etiqueta>{MEITI.t('list_acts', null, 'Listado de Actividades')}</UI.Etiqueta>
            </div>
            <div className="w-full md:w-64">
              <UI.Desplegable valor={filtroEstado} onCambio={e => setFiltroEstado(e.target.value)} opciones={[{value:'todas', label: MEITI.t('flt_all', null, 'Todas las actividades')}, {value:'pendiente', label: MEITI.t('flt_pend', null, 'Solo Pendientes')}, {value:'completada', label: MEITI.t('flt_done', null, 'Solo Completadas')}]} />
            </div>
          </div>

          {cargando ? (
            <p style={{ color: tema.texto }}>{MEITI.t('loading', null, 'Cargando actividades...')}</p>
          ) : actsFiltradas.length === 0 ? (
            <UI.EstadoVacio icono="fa-clipboard-check" mensaje={MEITI.t('empty_acts', null, 'No hay actividades que coincidan con el filtro.')} />
          ) : (
            <UI.TablaDatos columnas={columnas} datos={actsFiltradas} claveId="id" onEditar={editar} onBorrar={(f) => borrar(f.id)} accionesExtra={accionesExtra} />
          )}
        </UI.Tarjeta>
      </Animacion.motion.div>
    </div>
  );
}