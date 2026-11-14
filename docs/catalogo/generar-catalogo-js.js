const fs=require('fs'), path=require('path');
const cat=JSON.parse(fs.readFileSync(path.join(__dirname,'catalogo-por-barrera-borrador.json'),'utf8'));
const nuevos=JSON.parse(fs.readFileSync(path.join(__dirname,'apoyos-nuevos.json'),'utf8'));
const COND={fisica:'Física',auditiva:'Auditiva',visual:'Visual',sordoceguera:'Sordoceguera',tactil:'Táctil',vestibular:'Vestibular',visceral:'Visceral',intelectual:'Intelectual',psiquica:'Psíquica',autismo:'Neurodesarrollo'};
function fuente(f){
  if(f.startsWith('catalogo:')) return {cita:'Catálogo UIE por condición ('+(COND[f.split(':')[1].split('.')[0]]||f)+')',url:''};
  if(f.startsWith('regla:')) return {cita:'Regla de la matriz CIF del planificador UIE',url:''};
  if(f.startsWith('nuevo:')) return nuevos.fuentes[f.slice(6)]||{cita:f,url:''};
  return {cita:f,url:''};
}
const apoyos=cat.map(a=>{
  const fs=[]; a.fuentes.map(fuente).forEach(x=>{ if(!fs.some(y=>y.cita===x.cita)) fs.push(x); });
  return {id:a.id,texto:a.texto,actividades:a.actividades,origenes:a.origenes,tipo:a.tipo,modalidades:a.modalidades,momentos:a.momentos,etiquetas:a.etiquetas,noCambia:a.noCambia,noAplica:a.noAplica,fuentes:fs,estado:a.estado,nuevo:!!a.nuevo};
});
const out='window.UiePlannerCatalog = '+JSON.stringify({version:new Date().toISOString().slice(0,10),estado:'en revision',apoyos})+';\n';
fs.writeFileSync(path.join(__dirname,'../../catalogo.js'),out);
console.log('catalogo.js',apoyos.length,'apoyos',out.length,'bytes');
