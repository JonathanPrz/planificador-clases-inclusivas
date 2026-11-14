const fs=require('fs'), vm=require('vm');
const src=fs.readFileSync(require('path').join(__dirname,'../../data.js'),'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(src,ctx);
const D=ctx.window.UiePlannerData;
const A=D.accommodationsData, M=D.accommodationCifMap, R=D.matrixRecommendationRules;
const ORIG={fisica:['motor'],auditiva:['auditivo'],visual:['visual'],sordoceguera:['visual','auditivo'],tactil:['sensorial'],vestibular:['sensorial','motor'],visceral:['salud'],intelectual:['cognitivo'],psiquica:['regulacion'],autismo:['social','cognitivo','regulacion']};
const CAT_TIPO={context:'entorno',materials:'presentacion',methods:'presentacion',interaction:'entorno',evaluacion:'respuesta',tech:'respuesta'};
const CAT_MOM={context:'clase',materials:'fuera',methods:'clase',interaction:'clase',evaluacion:'evaluacion',tech:'clase'};
function tipo(t,cat){
  const s=t.toLowerCase();
  if(/tiempo adicional|más tiempo|plazo|pausa|ritmo|duración/.test(s)) return 'tiempo';
  if(/ubic|sala |ruta|espacio|ruido|ambiente|mesa|silla|asiento|fila|salir de la sala|iluminaci|desplaz|estímulo|lugar/.test(s)) return 'entorno';
  if(/respuesta|responder|exponer|exposici|dictado|\bescrib|participación oral|participaci|\bexpres|demostrar|grabaci/.test(s)) return 'respuesta';
  if(/material|texto|instrucci|subtítul|transcrip|describ|lectura|leer|formato|lengua de señas|braille|ampliaci|ejemplo|visual|esquema|resumen|vocabulario|anticip/.test(s)) return 'presentacion';
  return CAT_TIPO[cat]||'presentacion';
}
function momentos(t,cat){
  const s=t.toLowerCase(); const m=new Set();
  if(/evaluaci|prueba|examen|exposici/.test(s)||cat==='evaluacion') m.add('evaluacion');
  if(/plazo|entrega|ava|plataforma|anticip|antes de|con anticipación|material/.test(s)||cat==='materials') m.add('fuera');
  if(!m.size||cat==='context'||cat==='interaction'||cat==='methods') m.add('clase');
  return [...m];
}
function modalidades(t){
  const s=t.toLowerCase(); const m=new Set(['teorica','practica','online']);
  if(/práctic|taller|laborator|herramient|puesto de trabajo|de pie|procedimiento/.test(s)) { m.delete('teorica'); m.delete('online'); m.add('practica'); }
  if(/ava|plataforma|online|virtual|en línea/.test(s)) { m.add('online'); }
  if(/sala|ruta|desplaz|mesa|silla|asiento|fila|ubicaci|pizarra|ruido|sede/.test(s)) m.delete('online');
  if(/empresa|centro de práctica|práctica profesional|lugar de trabajo/.test(s)) m.add('profesional');
  return [...m];
}
function etiquetas(t,cat){
  const s=t.toLowerCase(); const e=new Set();
  if(cat==='tech'||/lector de pantalla|software|computador|tecnolog|ayuda técnica|teclado|audífono|sistema fm|magnific/.test(s)) e.add('tecnologia');
  if(/intérprete|tutor|guía|asistente|ayudante|compañer|par(es)? /.test(s)) e.add('apoyo_humano');
  if(/coordin|unidad|institucional|deriv/.test(s)) e.add('coordinacion');
  if(/lengua de señas/.test(s)) e.add('canal_lsch');
  if(/braille/.test(s)) e.add('canal_braille');
  if(/guía intérprete|guía-intérprete/.test(s)) e.add('canal_guia_interprete');
  return [...e];
}
const byText=new Map();
function add(text,acts,origs,cat,fuente){
  const key=text.trim();
  let e=byText.get(key);
  if(!e){ e={id:'', texto:key, actividades:new Set(), origenes:new Set(), tipo:tipo(key,cat), modalidades:modalidades(key), momentos:momentos(key,cat), etiquetas:etiquetas(key,cat), dimensionesDuoc:new Set(), noCambia:'', noAplica:'', fuentes:new Set(), estado:'pendiente'}; byText.set(key,e); }
  acts.forEach(a=>e.actividades.add(a)); origs.forEach(o=>e.origenes.add(o)); e.dimensionesDuoc.add(cat); e.fuentes.add(fuente);
}
Object.keys(A).forEach(cond=>{
  ['context','materials','methods','interaction','evaluacion','tech'].forEach(cat=>{
    (A[cond][cat]||[]).forEach((t,i)=>{
      const acts=(M[cond]&&M[cond][cat]&&M[cond][cat][i])||[];
      add(t,acts,ORIG[cond]||[],cat,'catalogo:'+cond+'.'+cat);
    });
  });
});
R.forEach(r=>{
  const origs=[...new Set(r.conditions.flatMap(c=>ORIG[c]||[]))];
  (r.dimensions||['methods']).forEach((d,i)=>{ if(i===0) add(r.text,r.activities,origs,d,'regla:'+r.id); else byText.get(r.text.trim()).dimensionesDuoc.add(d); });
});
let n=0; const out=[...byText.values()].map(e=>({...e,id:'ap'+String(++n).padStart(3,'0'),actividades:[...e.actividades],origenes:[...e.origenes],dimensionesDuoc:[...e.dimensionesDuoc],fuentes:[...e.fuentes]}));
const NUEVOS=JSON.parse(fs.readFileSync(require('path').join(__dirname,'apoyos-nuevos.json'),'utf8'));
out.forEach(e=>{
  (NUEVOS.reclasificar[e.id]||[]).forEach(a=>{ if(!e.actividades.includes(a)) e.actividades.push(a); });
  if(NUEVOS.noAplicaExistentes[e.id]&&!e.noAplica) e.noAplica=NUEVOS.noAplicaExistentes[e.id];
});
NUEVOS.apoyos.forEach(a=>{
  if(byText.has(a.texto.trim())) return;
  out.push({id:'ap'+String(++n).padStart(3,'0'),texto:a.texto,actividades:a.actividades,origenes:a.origenes,tipo:a.tipo,modalidades:a.modalidades,momentos:a.momentos,etiquetas:a.etiquetas,dimensionesDuoc:[],noCambia:a.noCambia,noAplica:a.noAplica,fuentes:a.fuentes.map(f=>'nuevo:'+f),estado:'pendiente',nuevo:true});
});
fs.writeFileSync(require('path').join(__dirname,'catalogo-por-barrera-borrador.json'),JSON.stringify(out,null,1));
const c=k=>{const m={};out.forEach(e=>[].concat(e[k]).forEach(v=>m[v]=(m[v]||0)+1));return m;};
console.log('total',out.length,'sin actividad',out.filter(e=>!e.actividades.length).length);
['tipo','origenes','modalidades','momentos','etiquetas'].forEach(k=>console.log(k,JSON.stringify(c(k))));
