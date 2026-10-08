import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const NexoCRM_muuwzbs7__CRM_GestorCatalogos = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();

  const [pestana, setPestana] = useState('etapas');
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);

  const configCatalogos = {
    etapas: {
      tabla: 'crm_etapas',
      titulo: MEITI.t('cat_stages', null, 'Etapas del Embudo'),
      icono: <Iconos.Filter size={20} color={tema.colorPrimario} />,
      columnas: [
        { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre'), render: f => <span className="font-bold">{f.nombre}</span> },
        { clave: 'orden', etiqueta: MEITI.t('col_order', null, 'Orden'), tipo: 'numero' },
        { clave: 'color', etiqueta: MEITI.t('col_color', null, 'Color'), render: f => <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full shadow-sm border" style={{backgroundColor: f.color || tema.colorPrimario, borderColor: tema.texto + '22'}}></div><span className="text-xs font-mono opacity-70">{f.color}</span></div> }
      ],
      campos: [
        { clave: 'nombre', etiqueta: MEITI.t('f_name', null, 'Nombre de la etapa'), tipo: 'text', placeholder: MEITI.t('ph_stage_name', null, 'Ej: Negociación') },
        { clave: 'orden', etiqueta: MEITI.t('f_order', null, 'Orden (1, 2, 3...)'), tipo: 'number', placeholder: '1' },
        { clave: 'color', etiqueta: MEITI.t('f_color', null, 'Color (Hexadecimal)'), tipo: 'text', placeholder: '#3b82f6' }
      ],
      vacio: { id: '', nombre: '', orden: '', color: '' }
    },
    tipos_actividad: {
      tabla: 'crm_tipos_actividad',
      titulo: MEITI.t('cat_act_types', null, 'Tipos de Actividad'),
      icono: <Iconos.ListTodo size={20} color={tema.colorPrimario} />,
      columnas: [
        { clave: 'icono', etiqueta: MEITI.t('col_icon', null, 'Ícono'), render: f => <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5"><i className={`fa-solid ${f.icono || 'fa-circle'}`} style={{color: tema.colorPrimario}}></i></div> },
        { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre'), render: f => <span className="font-bold">{f.nombre}</span> }
      ],
      campos: [
        { clave: 'nombre', etiqueta: MEITI.t('f_name', null, 'Nombre de la actividad'), tipo: 'text', placeholder: MEITI.t('ph_act_name', null, 'Ej: Llamada, Reunión') },
        { clave: 'icono', etiqueta: MEITI.t('f_icon', null, 'Ícono (FontAwesome)'), tipo: 'text', placeholder: 'fa-phone' }
      ],
      vacio: { id: '', nombre: '', icono: '' }
    },
    rubros: {
      tabla: 'crm_rubros',
      titulo: MEITI.t('cat_sectors', null, 'Rubros de Empresa'),
      icono: <Iconos.Building2 size={20} color={tema.colorPrimario} />,
      columnas: [
        { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre'), render: f => <span className="font-bold">{f.nombre}</span> }
      ],
      campos: [
        { clave: 'nombre', etiqueta: MEITI.t('f_name', null, 'Nombre del rubro'), tipo: 'text', placeholder: MEITI.t('ph_sector_name', null, 'Ej: Tecnología, Salud') }
      ],
      vacio: { id: '', nombre: '' }
    },
    motivos_perdida: {
      tabla: 'crm_motivos_perdida',
      titulo: MEITI.t('cat_loss_reasons', null, 'Motivos de Pérdida'),
      icono: <Iconos.ThumbsDown size={20} color={tema.colorPrimario} />,
      columnas: [
        { clave: 'nombre', etiqueta: MEITI.t('col_name', null, 'Nombre'), render: f => <span className="font-bold">{f.nombre}</span> }
      ],
      campos: [
        { clave: 'nombre', etiqueta: MEITI.t('f_name', null, 'Motivo de pérdida'), tipo: 'text', placeholder: MEITI.t('ph_loss_reason', null, 'Ej: Precio alto, Competencia') }
      ],
      vacio: { id: '', nombre: '' }
    }
  };

  const pestanasArr = [
    { id: 'etapas', titulo: MEITI.t('tab_stages', null, 'Etapas'), icono: 'fa-filter' },
    { id: 'tipos_actividad', titulo: MEITI.t('tab_activities', null, 'Actividades'), icono: 'fa-list-check' },
    { id: 'rubros', titulo: MEITI.t('tab_sectors', null, 'Rubros'), icono: 'fa-building' },
    { id: 'motivos_perdida', titulo: MEITI.t('tab_loss', null, 'Motivos Pérdida'), icono: 'fa-thumbs-down' }
  ];

  const cargarDatos = async () => {
    setCargando(true);
    const conf = configCatalogos[pestana];
    const url = `/api/boveda/${MEITI.obtenerTabla(conf.tabla)}?ecosistema=${eco}`;
    
    const res = await MEITI.fetchDatosPropios(url);
    if (res.ok) {
      let data = res.registros || [];
      if (pestana === 'etapas') {
        data.sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));
      }
      setRegistros(data);
    } else {
      setError(res.error || MEITI.t('err_load_cat', null, 'Error al cargar el catálogo.'));
    }
    setCargando(false);
  };

  useEffect(() => {
    setForm(configCatalogos[pestana].vacio);
    setError(null);
    setExito(null);
    cargarDatos();
  }, [pestana]);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!form.nombre?.trim()) {
      return setError(MEITI.t('err_name_req', null, 'El nombre es obligatorio.'));
    }

    setGuardando(true);
    const conf = configCatalogos[pestana];
    const esNuevo = !form.id;
    
    const payload = { ...form, usuario_id: miId };
    if (esNuevo) payload.id = `${pestana}_${Date.now()}`;
    if (pestana === 'etapas') payload.orden = Number(payload.orden) || 0;

    const url = `/api/boveda/${MEITI.obtenerTabla(conf.tabla)}?ecosistema=${eco}`;
    
    await MEITI.mutar(url, {
      method: esNuevo ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => {
        setExito(MEITI.t('msg_saved', null, 'Registro guardado correctamente.'));
        setForm(conf.vacio);
        cargarDatos();
        setGuardando(false);
      },
      alFallar: (err) => {
        setError(err || MEITI.t('err_save', null, 'Error al guardar el registro.'));
        setGuardando(false);
      }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('q_delete_cat', null, '¿Borrar este registro del catálogo?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_delete', null, 'Sí, borrar'), tono: 'peligro' })) return;
    
    setError(null);
    setExito(null);
    const conf = configCatalogos[pestana];
    const url = `/api/boveda/${MEITI.obtenerTabla(conf.tabla)}?ecosistema=${eco}&id=${id}`;
    
    await MEITI.mutar(url, { method: 'DELETE' }, {
      alLograr: () => {
        setExito(MEITI.t('msg_deleted', null, 'Registro eliminado.'));
        if (form.id === id) setForm(conf.vacio);
        cargarDatos();
      },
      alFallar: (err) => setError(err || MEITI.t('err_delete', null, 'Error al eliminar el registro.'))
    });
  };

  const editar = (fila) => {
    const conf = configCatalogos[pestana];
    const nuevoForm = { ...conf.vacio };
    Object.keys(nuevoForm).forEach(k => {
      if (fila[k] !== undefined) nuevoForm[k] = fila[k];
    });
    setForm(nuevoForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confActual = configCatalogos[pestana];

  return (
    <div className="flex flex-col gap-6">
      <UI.Pestanas pestanas={pestanasArr} activa={pestana} onCambio={setPestana} />

      <Animacion.AnimatePresence mode="wait">
        <Animacion.motion.div 
          key={pestana}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-6"
        >
          <UI.Tarjeta>
            <div className="flex items-center gap-2 mb-4">
              {confActual.icono}
              <UI.Etiqueta>{form.id ? MEITI.t('edit_record', null, 'Editar Registro') : MEITI.t('new_record', null, 'Nuevo Registro')}</UI.Etiqueta>
            </div>
            
            <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
            <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />

            <form onSubmit={guardar} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confActual.campos.map(c => (
                  <div key={c.clave} className="flex-1">
                    <UI.Campo 
                      etiqueta={c.etiqueta} 
                      tipo={c.tipo} 
                      valor={form[c.clave] || ''} 
                      onChange={e => setForm({...form, [c.clave]: e.target.value})} 
                      placeholder={c.placeholder}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <UI.Boton tipo="submit" variante="primario" disabled={guardando}>
                  <span className="flex items-center gap-2">
                    <Iconos.Save size={16} /> 
                    {guardando ? MEITI.t('saving', null, 'Guardando...') : (form.id ? MEITI.t('btn_update', null, 'Actualizar') : MEITI.t('btn_add', null, 'Agregar'))}
                  </span>
                </UI.Boton>
                {form.id && (
                  <UI.Boton tipo="button" variante="secundario" onClick={() => setForm(confActual.vacio)}>
                    <span className="flex items-center gap-2"><Iconos.X size={16} /> {MEITI.t('btn_cancel', null, 'Cancelar')}</span>
                  </UI.Boton>
                )}
              </div>
            </form>
          </UI.Tarjeta>

          <UI.Tarjeta className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Iconos.List size={20} color={tema.colorSecundario} />
                <UI.Etiqueta>{confActual.titulo}</UI.Etiqueta>
              </div>
              <UI.Chip tono="neutro">{registros.length} {MEITI.t('records', null, 'registros')}</UI.Chip>
            </div>

            {cargando ? (
              <div className="p-8 text-center">
                <Iconos.Loader className="animate-spin mx-auto" size={24} color={tema.colorPrimario} />
                <p className="mt-2 opacity-70" style={{ color: tema.texto }}>{MEITI.t('loading_cat', null, 'Cargando catálogo...')}</p>
              </div>
            ) : registros.length === 0 ? (
              <UI.EstadoVacio icono="fa-box-open" mensaje={MEITI.t('empty_cat', null, 'Este catálogo está vacío. Agrega el primer registro arriba.')} />
            ) : (
              <UI.TablaDatos 
                columnas={confActual.columnas} 
                datos={registros} 
                claveId="id" 
                onEditar={editar} 
                onBorrar={(f) => borrar(f.id)} 
              />
            )}
          </UI.Tarjeta>
        </Animacion.motion.div>
      </Animacion.AnimatePresence>
    </div>
  );
};

export default NexoCRM_muuwzbs7__CRM_GestorCatalogos;
