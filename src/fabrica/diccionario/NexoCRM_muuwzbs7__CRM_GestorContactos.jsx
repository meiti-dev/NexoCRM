import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const NexoCRM_muuwzbs7__CRM_GestorContactos = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const uid = MEITI.obtenerUsuarioActual();
  const tCont = MEITI.obtenerTabla('crm_contactos');
  
  const vacio = { id: '', nombre: '', empresa_id: '', cargo: '', email: '', telefono: '', notas: '' };
  const [form, setForm] = useState(vacio);
  const [contactos, setContactos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const cargar = async () => {
    setCargando(true);
    const [resCont, resEmp] = await Promise.all([
      MEITI.fetchDatosPropios(`/api/boveda/${tCont}?ecosistema=${eco}`),
      MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('crm_empresas')}?ecosistema=${eco}`)
    ]);
    if (resCont.ok) setContactos(resCont.registros || []);
    if (resEmp.ok) setEmpresas(resEmp.registros || []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null); setExito(null);
    if (!form.nombre.trim()) return setError(MEITI.t('req_name', null, 'El nombre es obligatorio.'));
    
    setGuardando(true);
    const payload = { ...form, id: form.id || 'cnt_' + Date.now(), usuario_id: uid, nombre: form.nombre.trim() };

    await MEITI.mutar(`/api/boveda/${tCont}?ecosistema=${eco}`, {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => { setExito(MEITI.t('cnt_saved', null, 'Contacto guardado.')); setForm(vacio); cargar(); setGuardando(false); },
      alFallar: (err) => { setError(err || MEITI.t('err_save', null, 'Error al guardar.')); setGuardando(false); }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('del_cnt_q', null, '¿Borrar este contacto?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_del', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${tCont}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, {
      alLograr: () => { setExito(MEITI.t('cnt_deleted', null, 'Contacto borrado.')); if (form.id === id) setForm(vacio); cargar(); },
      alFallar: (err) => setError(err || MEITI.t('err_del', null, 'Error al borrar.'))
    });
  };

  const editar = (fila) => {
    setForm({ ...vacio, ...fila });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columnas = [
    { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre') },
    { clave: 'cargo', etiqueta: MEITI.t('col_role', null, 'Cargo') },
    { clave: 'empresa_id', etiqueta: MEITI.t('col_company', null, 'Empresa'), render: (f) => empresas.find(e => e.id === f.empresa_id)?.nombre || '--' },
    { clave: 'email', etiqueta: MEITI.t('col_email', null, 'Email'), render: (f) => <span className="font-mono text-xs">{f.email}</span> },
    { clave: 'telefono', etiqueta: MEITI.t('col_phone', null, 'Teléfono'), render: (f) => <span className="font-mono text-xs">{f.telefono}</span> }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Animacion.motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.User size={18} color={tema.colorPrimario} />
            <UI.Etiqueta>{form.id ? MEITI.t('edit_cnt', null, 'Editar Contacto') : MEITI.t('new_cnt', null, 'Nuevo Contacto')}</UI.Etiqueta>
          </div>
          <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
          <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />
          <form onSubmit={guardar} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_name', null, 'Nombre')} tipo="text" valor={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_company', null, 'Empresa')} tipo="select" valor={form.empresa_id} onChange={e => setForm({...form, empresa_id: e.target.value})} opciones={[{value:'', label:'-- Seleccionar --'}, ...empresas.map(e => ({value: e.id, label: e.nombre}))]} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_role', null, 'Cargo')} tipo="text" valor={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_email', null, 'Email')} tipo="text" valor={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="flex-1"><UI.Campo etiqueta={MEITI.t('f_phone', null, 'Teléfono')} tipo="text" valor={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
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
          {MEITI.t('cnt_list', null, 'Directorio de Contactos')} · {contactos.length}
        </div>
        {cargando ? <div className="p-4 text-sm" style={{color: tema.texto}}>{MEITI.t('loading', null, 'Cargando...')}</div> : contactos.length === 0 ? <UI.EstadoVacio icono="fa-address-book" mensaje={MEITI.t('no_cnts', null, 'No hay contactos registrados.')} /> : (
          <div className="[&_td]:py-2 [&_th]:py-2">
            <UI.TablaDatos columnas={columnas} datos={contactos} claveId="id" onEditar={editar} onBorrar={(f) => borrar(f.id)} />
          </div>
        )}
      </UI.Tarjeta>
    </div>
  );
};

export default NexoCRM_muuwzbs7__CRM_GestorContactos;
