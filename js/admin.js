(function(){
var $=function(s){return document.querySelector(s)},D,AK="mashtal_admin",tab="products",imgs=[],editing=null;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function uid(){return"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function toast(m){var t=$("#toast");t.textContent=m;t.hidden=false;setTimeout(function(){t.hidden=true},2200)}
function persist(m){if(DB.save(D))toast(m||"تم الحفظ")}
function cn(id){var c=D.categories.filter(function(x){return x.id===id})[0];return c?c.name:"—"}
function sha(s){if(window.crypto&&crypto.subtle)return crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return("0"+x.toString(16)).slice(-2)}).join("")});var h=5381;for(var i=0;i<s.length;i++)h=(h*33)^s.charCodeAt(i);return Promise.resolve("x"+(h>>>0))}
function gate(){var has=localStorage.getItem(AK);
 $("#gate").innerHTML='<h1>لوحة التحكم</h1><p>'+(has?"أدخل كلمة المرور":"أنشئ كلمة مرور لأول مرة (6 أحرف على الأقل)")+'</p><input id="pw" type="password" aria-label="كلمة المرور"><p id="gerr" class="err" role="alert"></p><button class="btn" id="go">'+(has?"دخول":"حفظ ودخول")+'</button>';
 $("#go").onclick=function(){var v=$("#pw").value;if(!has&&v.length<6){$("#gerr").textContent="كلمة المرور أقصر من 6 أحرف.";return}
  sha(v).then(function(h){if(has&&h!==has){$("#gerr").textContent="كلمة المرور غير صحيحة.";return}if(!has)localStorage.setItem(AK,h);sessionStorage.setItem("mashtal_auth","1");start()})};
 $("#pw").addEventListener("keydown",function(e){if(e.key==="Enter")$("#go").click()})}
function start(){D=DB.get();$("#gate").hidden=true;$("#app").hidden=false;render()}
function render(){document.querySelectorAll("[data-tab]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.tab===tab)});
 $("#v").innerHTML=editing?vForm():{products:vProducts,cats:vCats,set:vSet,faq:vFaq,bak:vBak}[tab]();if(editing)drawIms()}
function vProducts(){var h='<div class="bar2"><h2>المنتجات ('+D.products.length+')</h2><button class="btn" data-act="new">+ منتج جديد</button></div><div class="tw"><table><tr><th></th><th>الاسم</th><th>التصنيف</th><th>السعر</th><th>الكمية</th><th>الحالة</th><th></th></tr>';
 D.products.forEach(function(p){h+='<tr><td><img src="'+esc((p.images||[])[0]||"assets/icons/leaf.svg")+'" width="40" height="40" alt=""></td><td>'+esc(p.name)+(p.featured?" ★":"")+'</td><td>'+esc(cn(p.cat))+'</td><td>'+esc(p.price)+'</td><td>'+(p.qty===""||p.qty==null?"—":esc(p.qty))+'</td><td>'+(p.available===false?"غير متاح":"متاح")+'</td><td><button class="sm" data-act="edit" data-id="'+esc(p.id)+'">تعديل</button> <button class="sm del" data-act="del" data-id="'+esc(p.id)+'">حذف</button></td></tr>'});
 return h+"</table></div>"+(D.products.length?"":"<p>لا توجد منتجات. أضف أول منتج.</p>")}
function vForm(){var p=editing,o=D.categories.map(function(c){return'<option value="'+esc(c.id)+'"'+(c.id===p.cat?" selected":"")+">"+esc(c.name)+"</option>"}).join("");
 return'<h2>'+(p.id?"تعديل منتج":"منتج جديد")+'</h2><div class="f"><label>الاسم<input id="f-name" value="'+esc(p.name)+'"></label><label>التصنيف<select id="f-cat"><option value="">بدون تصنيف</option>'+o+'</select></label><label>الوصف<textarea id="f-desc" rows="4">'+esc(p.desc)+'</textarea></label><label>السعر (جنيه)<input id="f-price" type="number" min="0" step="0.01" value="'+esc(p.price)+'"></label><label>السعر قبل الخصم (اختياري — يظهر المنتج في العروض)<input id="f-old" type="number" min="0" step="0.01" value="'+esc(p.oldPrice)+'"></label><label>وحدة البيع (مثل: للكيلو، للعلبة)<input id="f-unit" value="'+esc(p.unit)+'"></label><label>الكمية المتاحة (اتركها فارغة إن لم تُتتبع)<input id="f-qty" type="number" min="0" step="1" value="'+esc(p.qty)+'"></label><label class="ck"><input type="checkbox" id="f-av"'+(p.available===false?"":" checked")+'> متاح للطلب</label><label class="ck"><input type="checkbox" id="f-ft"'+(p.featured?" checked":"")+'> منتج مميز</label><div><b>الصور (الأولى هي الرئيسية)</b><div class="ims" id="ims"></div><input type="file" id="f-file" accept="image/*" multiple><label>أو مسار صورة داخل المشروع<span class="row"><input id="f-path" placeholder="assets/images/products/name.jpg" style="flex:1"><button class="sm" data-act="addpath">إضافة</button></span></label></div><p class="err" id="ferr" role="alert"></p><div class="row"><button class="btn" data-act="save">حفظ المنتج</button><button class="sm" data-act="cancel">إلغاء</button></div></div>'}
function drawIms(){$("#ims").innerHTML=imgs.map(function(s,i){return'<div><img src="'+esc(s)+'" alt=""><button data-act="rmimg" data-i="'+i+'" aria-label="حذف الصورة">✕</button></div>'}).join("")||'<span class="note">لا توجد صور.</span>'}
function readImg(f){return new Promise(function(res){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){var s=Math.min(1,800/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext("2d").drawImage(i,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.8))};i.onerror=function(){res(null)};i.src=r.result};r.onerror=function(){res(null)};r.readAsDataURL(f)})}
function saveProduct(){var e=$("#ferr"),n=$("#f-name").value.trim(),pr=parseFloat($("#f-price").value),old=$("#f-old").value,qty=$("#f-qty").value;
 if(!n){e.textContent="اكتب اسم المنتج.";return}if(!(pr>=0)){e.textContent="اكتب سعرًا صحيحًا.";return}
 if(old!==""&&!(parseFloat(old)>=0)){e.textContent="السعر قبل الخصم غير صحيح.";return}
 if(qty!==""&&!(parseInt(qty,10)>=0)){e.textContent="الكمية غير صحيحة.";return}
 var p=editing.id?D.products.filter(function(x){return x.id===editing.id})[0]:{id:uid(),created:Date.now()};
 p.name=n;p.cat=$("#f-cat").value;p.desc=$("#f-desc").value.trim();p.price=pr;p.oldPrice=old===""?"":parseFloat(old);p.unit=$("#f-unit").value.trim();p.qty=qty===""?"":parseInt(qty,10);p.available=$("#f-av").checked;p.featured=$("#f-ft").checked;p.images=imgs.slice();
 if(!editing.id)D.products.unshift(p);persist("تم حفظ المنتج");editing=null;render()}
function vCats(){return'<h2>التصنيفات</h2><div class="f">'+D.categories.map(function(c,i){return'<div class="row"><input data-cn="'+i+'" value="'+esc(c.name)+'" aria-label="اسم التصنيف" style="flex:1"><button class="sm del" data-act="delcat" data-i="'+i+'">حذف</button></div>'}).join("")+'<p class="row"><input id="nc" placeholder="تصنيف جديد" style="flex:1"><button class="sm" data-act="addcat">إضافة</button></p></div><button class="btn" data-act="savecats">حفظ التصنيفات</button>'}
var FS=[["name","اسم المشتل"],["heroTitle","عنوان الصفحة الرئيسية"],["heroText","وصف الصفحة الرئيسية","t"],["about","نبذة عن المشتل","t"],["whatsapp","رقم واتساب (صيغة دولية دون +، مثل 201001234567)"],["phone","رقم الهاتف"],["address","العنوان"],["hours","أوقات العمل"],["facebook","رابط فيسبوك (يبدأ بـ https://)"],["instagram","رابط إنستجرام (يبدأ بـ https://)"]];
function vSet(){return'<h2>الصفحة الرئيسية وبيانات التواصل</h2><div class="f">'+FS.map(function(f){var v=esc(D.settings[f[0]]);return"<label>"+f[1]+(f[2]?'<textarea data-s="'+f[0]+'" rows="3">'+v+"</textarea>":'<input data-s="'+f[0]+'" value="'+v+'">')+"</label>"}).join("")+'</div><p class="err" id="serr" role="alert"></p><button class="btn" data-act="saveset">حفظ</button>'}
function vFaq(){return'<h2>الأسئلة الشائعة</h2><div class="f">'+(D.faq||[]).map(function(x,i){return'<div class="panel" style="margin-bottom:8px"><label>السؤال<input data-fq="'+i+'" value="'+esc(x.q)+'"></label><label>الجواب<textarea data-fa="'+i+'" rows="2">'+esc(x.a)+'</textarea></label><button class="sm del" data-act="delfaq" data-i="'+i+'">حذف</button></div>'}).join("")+'</div><div class="row"><button class="sm" data-act="addfaq">+ سؤال</button><button class="btn" data-act="savefaq">حفظ</button></div>'}
function vBak(){return'<h2>النسخ الاحتياطي والنشر</h2><p>بياناتك محفوظة في هذا المتصفح فقط. زوار الموقع لا يرون تعديلاتك إلا بعد نشر ملف البيانات.</p><div class="row"><button class="btn" data-act="exp">تنزيل نسخة احتياطية (JSON)</button><label class="sm">استيراد نسخة احتياطية<input type="file" id="imp" accept=".json,application/json" hidden></label><button class="btn" data-act="pub">تنزيل data.js للنشر</button><button class="sm del" data-act="reset">استعادة البيانات الأصلية</button></div><p class="note">للنشر: نزّل data.js واستبدل به الملف js/data.js ثم ارفع المجلد. الصور المرفوعة من اللوحة تُحفظ داخل البيانات (حجم أكبر)؛ الأفضل وضع الصور في assets/images/products واستخدام مسارها.</p>'}
function dl(name,txt,type){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:type}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
function collect(sel,attr){var o=[];document.querySelectorAll(sel).forEach(function(el){o[+el.getAttribute(attr)]=el.value.trim()});return o}
document.addEventListener("click",function(e){var t=e.target.closest("[data-tab],[data-act]");if(!t)return;
 if(t.dataset.tab){tab=t.dataset.tab;editing=null;render();return}
 var a=t.dataset.act,id=t.dataset.id,i=+t.dataset.i;
 if(a==="logout"){sessionStorage.removeItem("mashtal_auth");location.reload()}
 else if(a==="new"){editing={available:true};imgs=[];render()}
 else if(a==="edit"){editing=D.products.filter(function(p){return p.id===id})[0];imgs=(editing.images||[]).slice();render()}
 else if(a==="del"){if(confirm("حذف هذا المنتج نهائيًا؟")){D.products=D.products.filter(function(p){return p.id!==id});persist("تم الحذف");render()}}
 else if(a==="cancel"){editing=null;render()}
 else if(a==="save")saveProduct();
 else if(a==="rmimg"){imgs.splice(i,1);drawIms()}
 else if(a==="addpath"){var v=$("#f-path").value.trim();if(!/^[\w\-.\/]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(v)||v.indexOf("..")>-1||v[0]==="/"){$("#ferr").textContent="مسار غير صالح. استخدم مسارًا نسبيًا داخل المشروع، مثل assets/images/products/name.jpg";return}imgs.push(v);$("#f-path").value="";$("#ferr").textContent="";drawIms()}
 else if(a==="addcat"){var n=$("#nc").value.trim();if(n){D.categories.push({id:uid(),name:n});persist();render()}}
 else if(a==="delcat"){var c=D.categories[i];if(confirm("حذف التصنيف؟ ستصبح منتجاته بدون تصنيف.")){D.products.forEach(function(p){if(p.cat===c.id)p.cat=""});D.categories.splice(i,1);persist();render()}}
 else if(a==="savecats"){collect("[data-cn]","data-cn").forEach(function(n,k){if(n)D.categories[k].name=n});persist();render()}
 else if(a==="saveset"){var s={};document.querySelectorAll("[data-s]").forEach(function(el){s[el.dataset.s]=el.value.trim()});
  if(s.whatsapp&&!/^\d{10,15}$/.test(s.whatsapp)){$("#serr").textContent="رقم واتساب يجب أن يكون أرقامًا فقط بصيغة دولية دون +.";return}
  if(!s.name){$("#serr").textContent="اسم المشتل مطلوب.";return}
  ["facebook","instagram"].forEach(function(k){if(s[k]&&!/^https?:\/\//.test(s[k]))s[k]=""});D.settings=Object.assign(D.settings,s);persist();render()}
 else if(a==="addfaq"){D.faq=D.faq||[];D.faq.push({q:"سؤال جديد",a:""});render()}
 else if(a==="delfaq"){D.faq.splice(i,1);persist();render()}
 else if(a==="savefaq"){var q=collect("[data-fq]","data-fq"),an=collect("[data-fa]","data-fa");D.faq=q.map(function(x,k){return{q:x,a:an[k]||""}}).filter(function(x){return x.q});persist();render()}
 else if(a==="exp")dl("backup-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(D,null,2),"application/json");
 else if(a==="pub")dl("data.js","window.SEED_DATA="+JSON.stringify(D,null,1)+";\n","text/javascript");
 else if(a==="reset"){if(confirm("حذف كل تعديلاتك والرجوع للبيانات الأصلية؟")){DB.reset();D=DB.get();toast("تمت الاستعادة");render()}}
});
document.addEventListener("change",function(e){
 if(e.target.id==="f-file"){Promise.all(Array.from(e.target.files).map(readImg)).then(function(r){r.forEach(function(x){if(x)imgs.push(x)});drawIms()})}
 if(e.target.id==="imp"){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!DB.valid(d))throw 0;if(confirm("سيتم استبدال بياناتك الحالية. متابعة؟")){D=d;persist("تم الاستيراد");render()}}catch(x){alert("الملف غير صالح كنسخة احتياطية.")}};r.readAsText(f)}});
if(sessionStorage.getItem("mashtal_auth")&&localStorage.getItem(AK))start();else gate();
})();
