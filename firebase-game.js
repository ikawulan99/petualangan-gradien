import {firebaseConfig as C} from './firebase-config.js';
const V='https://www.gstatic.com/firebasejs/10.12.2/';
if(!C.apiKey||C.apiKey.startsWith('ISI')){console.warn('Firebase belum dikonfigurasi: mode offline (tanpa kode kelas).')}else{
const {initializeApp}=await import(V+'firebase-app.js');
const {getAuth,signInAnonymously}=await import(V+'firebase-auth.js');
const {getFirestore,doc,getDoc,setDoc,updateDoc,addDoc,collection,onSnapshot,increment,serverTimestamp}=await import(V+'firebase-firestore.js');
const app=initializeApp(C),auth=getAuth(app),db=getFirestore(app);let pr,fin=false;
GA.join=async(c,name,color)=>{try{
  if(c.length<3)return{ok:false,msg:'Kode kelas tidak valid.'};
  await signInAnonymously(auth);const cr=doc(db,'classes',c),cs=await getDoc(cr);
  if(!cs.exists())return{ok:false,msg:'Kode kelas tidak ditemukan. Periksa kembali kode dari guru.'};
  if(cs.data().status==='stopped')return{ok:false,msg:'Permainan di kelas ini sudah dihentikan guru.'};
  GA.status=cs.data().status;GA.hintsOn=cs.data().hintsOn!==false;
  pr=doc(db,'classes',c,'players',auth.currentUser.uid);const ps=await getDoc(pr);let r=null;
  if(ps.exists()){r=ps.data();fin=!!r.done;await updateDoc(pr,{name,color,last:Date.now()})}
  else await setDoc(pr,{name,color,xp:0,ok:0,bad:0,lv:0,hints:0,tp1ok:0,tp1bad:0,done:false,ms:0,joined:Date.now(),last:Date.now()});
  let lt,first=true;
  onSnapshot(cr,s=>{const d=s.data();if(!d)return;GA.status=d.status;GA.hintsOn=d.hintsOn!==false;const a=d.announce;if(a&&a.ts!==lt){if(!first)say('📢 Guru: '+a.text);lt=a.ts}first=false});
  setInterval(()=>updateDoc(pr,{last:Date.now()}).catch(()=>{}),20000);
  return{ok:true,r};
 }catch(e){console.error(e);return{ok:false,msg:'Gagal terhubung ke server ('+(e.code||e.message)+'). Periksa koneksi internet.'}}};
GA.log=async x=>{if(!pr)return;try{
  await updateDoc(pr,{[x.ok?'ok':'bad']:increment(1),[x.ok?'tp1ok':'tp1bad']:increment(1),xp:increment(x.ok?250:0),lv:x.ok?x.lv+1:x.lv,last:Date.now()});
  await addDoc(collection(pr,'attempts'),{lv:x.lv+1,ok:x.ok,hint:x.hint,a:x.a,t:serverTimestamp()});
 }catch(e){console.warn(e)}};
GA.hint=()=>{if(pr)updateDoc(pr,{hints:increment(1)}).catch(()=>{})};
GA.done=ms=>{if(pr&&!fin){fin=true;updateDoc(pr,{done:true,ms}).catch(()=>{})}};
}
