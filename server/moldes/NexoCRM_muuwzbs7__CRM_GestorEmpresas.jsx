/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const uid = MEITI.obtenerUsuarioActual();
  const tEmp = MEITI.obtenerTabla('crm_empresas');
  
  const vacio = { id: '', nombre: '', rubro_id: '', tamano: '', sitio_web: '', telefono: '', direccion: '' };
  const [form, setForm] = useState(vacio);
  const [empresas, setEmpresas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const cargar = async () => {
    setCargando(true);
    const [resEmp, resRubros] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${tEmp}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_rubros')}?ecosistema=${eco}`)
    ]);
    if (resEmp.ok) setEmpresas(resEmp.registros || []);
    if (resRubros.ok) setRubros(resRubros.registros || []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null); setExito(null);
    if (!form.nombre.trim()) return setError(MEITI.t('req_name', null, 'El nombre es obligatorio.'));
    
    setGuardando(true);
    const payload = { ...form, id: form.id || 'emp_' + Date.now(), usuario_id: uid, nombre: form.nombre.trim() };

    await MEITI.mutar(`/api/boveda/${tEmp}?ecosistema=${eco}`, {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => { setExito(MEITI.t('emp_saved', null, 'Empresa guardada.')); setForm(vacio); cargar(); setGuardando(false); },
      alFallar: (err) => { setError(err || MEITI.t('err_save', null, 'Error al guardar.')); setGuardando(false); }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('del_emp_q', null, '¿Borrar esta empresa?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_del', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${tEmp}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, {
      alLograr: () => { setExito(MEITI.t('emp_deleted', null, 'Empresa borrada.')); if (form.id === id) setForm(vacio); cargar(); },
      alFallar: (err) => setError(err || MEITI.t('err_del', null, 'Error al borrar.'))
    });
  };

  const editar = (fila) => {
    setForm({ ...vacio, ...fila });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columnas = [
    { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre') },
    { clave: 'rubro_id', etiqueta: MEITI.t('col_industry', null, 'Rubro'), render: (f) => rubros.find(r => r.id === f.rubro_id)?.nombre || '--' },
    { clave: 'tamano', etiqueta: MEITI.t('col_size', null, 'Tamaño') },
    { clave: 'sitio_web', etiqueta: MEITI.t('col_website', null, 'Sitio Web'), render: (f) => <span className="font-mono text-xs text-blue-500">{f.sitio_web}</span> }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Animacion.motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.Building2 size={18} color={tema.colorPrimario} />
            <UI.Etiqueta>{form.id ? MEITI.t('edit_emp', null, 'Editar Empresa') : MEITI.t('new_emp', null, 'Nueva Empresa')}</UI.Etiqueta>
          </div>
          <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
          <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />
          <form onSubmit={guardar} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_name', null, 'Nombre')} tipo="text" valor={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_industry', null, 'Rubro')} tipo="select" valor={form.rubro_id} onChange={e => setForm({...form, rubro_id: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, ...rubros.map(r => ({value: r.id, label: r.nombre}))]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_size', null, 'Tamaño')} tipo="select" valor={form.tamano} onChange={e => setForm({...form, tamano: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, {value:'1-10', label:'1-10 emp.'}, {value:'11-50', label:'11-50 emp.'}, {value:'51-200', label:'51-200 emp.'}, {value:'200+', label:'200+ emp.'}]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_website', null, 'Sitio Web')} tipo="text" valor={form.sitio_web} onChange={e => setForm({...form, sitio_web: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_phone', null, 'Teléfono')} tipo="text" valor={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_address', null, 'Dirección')} tipo="text" valor={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
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
          {MEITI.t('emp_list', null, 'Directorio de Empresas')} · {empresas.length}
        </div>
        {cargando ? <div className="p-4 text-sm" style={{color: tema.texto}}>{MEITI.t('loading', null, 'Cargando...')}</div> : empresas.length === 0 ? <UI.EstadoVacio icono="fa-building" mensaje={MEITI.t('no_emps', null, 'No hay empresas registradas.')} /> : (
          <div className="[&_td]:py-2 [&_th]:py-2">
            <UI.TablaDatos columnas={columnas} datos={empresas} claveId="id" onEditar={editar} onBorrar={(f) => borrar(f.id)} />
          </div>
        )}
      </UI.Tarjeta>
    </div>
  );
}