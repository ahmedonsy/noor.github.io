(function(){
"use strict";
var D=DB.get(),S=D.settings,$=function(s){return document.querySelector(s)},cat="",cart=[],CK="mashtal_cart_v1",lastFocus=null;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function egp(q){var v=q/100;return(v%1?v.toFixed(2):v)+" جنيه"}
function wl(g){return g>=1000?(g/1000)+" كيلو":g+" جرام"}
function nz(s){return String(s).toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[\u064B-\u0652]/g,"")}
function find(id){return D.products.filter(function(p){return p.id===id})[0]}
function isKg(p){return p.sellBy==="kg"&&p.weights&&p.weights.length>0}
function up(p,g){return Math.round(Number(p.price)*100*(isKg(p)?g/1000:1))}
function offer(p){return Number(p.oldPrice)>Number(p.price)}
function img(p){return(p.images&&p.images[0])||"assets/icons/leaf.svg"}
function wa(t){var n=String(S.whatsapp||"").replace(/\D/g,"");return n?"https://wa.me/"+n+(t?"?text="+encodeURIComponent(t):""):""}
function delivery(){return S.delivery===""||S.delivery==null||isNaN(Number(S.delivery))?null:Math.round(Number(S.delivery)*100)}
try{cart=JSON.parse(localStorage.getItem(CK))||[]}catch(e){cart=[]}
cart=cart.filter(function(c){var p=find(c.id);return p&&c.q>0&&(isKg(p)?p.weights.indexOf(c.g)>-1:c.g===0)});
function saveCart(){try{localStorage.setItem(CK,JSON.stringify(cart))}catch(e){}}
function wsel(p){return'<select class="w" aria-label="اختر الوزن"><option value="">اختر الوزن</option>'+p.weights.map(function(g){return'<option value="'+g+'">'+wl(g)+" – "+egp(up(p,g))+"</option>"}).join("")+"</select>"}
function ptxt(p){return'<div class="price">'+egp(Number(p.price)*100)+' <small>'+(isKg(p)?"للكيلو":esc(p.unit))+"</small>"+(offer(p)?' <s>'+egp(Number(p.oldPrice)*100)+"</s>":"")+"</div>"}
function addBtn(p){var o=p.available===false;return'<button class="btn" data-add="'+esc(p.id)+'"'+(o?" disabled":"")+">"+(o?"نفذت الكمية":"أضف للسلة")+"</button>"}
function card(p){var tag=p.available===false?'<span class="tag off">نفذت الكمية</span>':offer(p)?'<span class="tag">عرض</span>':p.featured?'<span class="tag">مميز</span>':"";
 return'<article class="card"><button class="ph" data-id="'+esc(p.id)+'" aria-label="تفاصيل '+esc(p.name)+'"><img src="'+esc(img(p))+'" width="400" height="400" alt="'+esc(p.name)+'" loading="lazy" decoding="async">'+tag+'</button><div class="cb"><h3>'+esc(p.name)+"</h3>"+ptxt(p)+(isKg(p)?wsel(p):"")+'<div class="row2">'+addBtn(p)+'<button class="btn lt" data-id="'+esc(p.id)+'">تفاصيل</button></div></div></article>'}
function list(){var q=nz($("#q").value.trim());
 var l=D.products.filter(function(p){return(!cat||p.cat===cat)&&(!q||nz(p.name+" "+p.desc).indexOf(q)>-1)});
 $("#gp").innerHTML=l.map(card).join("");$("#empty").hidden=l.length>0}
function chips(){$("#chips").innerHTML=[{id:"",name:"الكل"}].concat(D.categories).map(function(c){return'<button class="chip" data-cat="'+esc(c.id)+'" aria-pressed="'+(c.id===cat)+'">'+esc(c.name)+"</button>"}).join("")}
function show(id){var p=find(id);if(!p)return;var im=p.images&&p.images.length?p.images:["assets/icons/leaf.svg"],c=D.categories.filter(function(x){return x.id===p.cat})[0];
 $("#md").innerHTML='<button class="x" data-close aria-label="إغلاق">✕</button><img class="main" id="mi" src="'+esc(im[0])+'" width="560" height="560" alt="'+esc(p.name)+'" decoding="async">'+(im.length>1?'<div class="th">'+im.map(function(s){return'<img data-src="'+esc(s)+'" src="'+esc(s)+'" width="56" height="56" alt="" loading="lazy" decoding="async">'}).join("")+"</div>":"")+"<h2>"+esc(p.name)+"</h2>"+(c?'<p class="note">'+esc(c.name)+"</p>":"")+ptxt(p)+"<p>"+esc(p.desc)+"</p><p>الحالة: <b>"+(p.available===false?"نفذت الكمية":"متوفر")+"</b></p>"+(isKg(p)?wsel(p):"")+'<div class="row2">'+addBtn(p)+"</div>";
 $("#ov").hidden=false}
function lines(){var sub=0,h="";
 if(!cart.length){$("#cl").innerHTML='<p>سلتك فارغة.</p>';$("#ck").hidden=true;return}
 cart.forEach(function(c,i){var p=find(c.id),u=up(p,c.g);sub+=u*c.q;h+='<div class="ln"><b>'+esc(p.name)+"</b><span class=\"note\">"+(c.g?"الوزن: "+wl(c.g):"")+" · سعر الوحدة: "+egp(u)+'</span><div class="r"><span class="st"><button data-dec="'+i+'" aria-label="إنقاص">−</button><span>'+c.q+'</span><button data-inc="'+i+'" aria-label="زيادة">+</button></span><b>'+egp(u*c.q)+'</b><button class="sm" data-rm="'+i+'">حذف</button></div></div>'});
 var dv=delivery();$("#cl").innerHTML=h;$("#ck").hidden=false;
 $("#tt").innerHTML="<div><span>المجموع الفرعي</span><span>"+egp(sub)+"</span></div><div><span>التوصيل</span><span>"+(dv==null?"يُحدد عند التأكيد":egp(dv))+'</span></div><div class="t"><span>الإجمالي'+(dv==null?" (بدون التوصيل)":"")+"</span><span>"+egp(sub+(dv||0))+"</span></div>";
 return sub}
function badge(){$("#cnt").textContent=cart.reduce(function(a,c){return a+c.q},0)}
function upd(){saveCart();badge();lines()}
function add(p,g){if(p.available===false)return;var k=cart.filter(function(c){return c.id===p.id&&c.g===g})[0];if(k)k.q=Math.min(99,k.q+1);else cart.push({id:p.id,g:g,q:1});upd();var f=$("#fab");f.animate([{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:300})}
function openCart(){lastFocus=document.activeElement;lines();$("#cv").classList.add("on");document.body.style.overflow="hidden";$("[data-close-cart].x").focus()}
function closeCart(){$("#cv").classList.remove("on");document.body.style.overflow="";if(lastFocus)lastFocus.focus()}
function order(e){e.preventDefault();var er=$("#er"),n=$("#cn").value.trim(),ph=$("#cp").value.replace(/[\s-]/g,""),a=$("#ca").value.trim(),o=$("#co").value.trim();
 if(!cart.length){er.textContent="السلة فارغة.";return}
 if(!n){er.textContent="اكتب الاسم.";return}
 if(!/^(\+?20|0)1[0125]\d{8}$/.test(ph)){er.textContent="رقم الهاتف غير صحيح (مثال: 01012345678).";return}
 if(a.length<5){er.textContent="اكتب العنوان بالتفصيل.";return}
 if(!wa()){er.textContent="رقم واتساب المتجر غير مضبوط.";return}
 er.textContent="";var sub=0,m=["مرحباً "+S.name+"، أريد طلب المنتجات التالية:","","بيانات العميل:","الاسم: "+n,"رقم الهاتف: "+ph,"العنوان: "+a];if(o)m.push("ملاحظات: "+o);m.push("","تفاصيل الطلب:");
 cart.forEach(function(c,i){var p=find(c.id),u=up(p,c.g);sub+=u*c.q;m.push("",""+(i+1)+". "+p.name,c.g?"الوزن: "+wl(c.g):"الوحدة: "+(p.unit||"قطعة"),"الكمية: "+c.q,"سعر الوحدة: "+egp(u),"الإجمالي: "+egp(u*c.q))});
 var dv=delivery();m.push("","المجموع الفرعي: "+egp(sub),"التوصيل: "+(dv==null?"يُحدد عند التأكيد":egp(dv)),"الإجمالي النهائي: "+egp(sub+(dv||0))+(dv==null?" (بدون التوصيل)":""),"","شكراً لكم.");
 var u=wa(m.join("\n")),l=document.createElement("a");l.href=u;l.target="_blank";l.rel="noopener noreferrer";document.body.appendChild(l);l.click();l.remove();
 $("#nt").innerHTML='تم تجهيز الطلب. اضغط إرسال داخل واتساب لإتمامه. لو لم يفتح اضغط <a href="'+u+'" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">هنا</a>.'}
document.addEventListener("click",function(e){var t=e.target,b;
 if((b=t.closest("[data-add]"))){var p=find(b.dataset.add),box=b.closest(".card,#md"),s=box.querySelector("select.w"),g=0;
  if(isKg(p)){g=s?+s.value:0;if(!g){s.classList.add("bad");s.focus();return}s.classList.remove("bad")}add(p,g);return}
 if((b=t.closest("[data-cat]"))){cat=b.dataset.cat;chips();list();return}
 if((b=t.closest("[data-id]"))){show(b.dataset.id);return}
 if(t.closest("[data-close]")||t.id==="ov"){$("#ov").hidden=true;return}
 if((b=t.closest("[data-src]"))){$("#mi").src=b.dataset.src;return}
 if(t.closest("[data-cart]")){openCart();return}
 if(t.closest("[data-close-cart]")){closeCart();return}
 if((b=t.closest("[data-inc]"))){var c=cart[+b.dataset.inc];c.q=Math.min(99,c.q+1);upd();return}
 if((b=t.closest("[data-dec]"))){var d=cart[+b.dataset.dec];d.q--;if(d.q<1)cart.splice(+b.dataset.dec,1);upd();return}
 if((b=t.closest("[data-rm]"))){cart.splice(+b.dataset.rm,1);upd();return}
 if(t.closest("[data-clear]")){cart=[];upd();return}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){$("#ov").hidden=true;if($("#cv").classList.contains("on"))closeCart()}});
$("#q").addEventListener("input",list);$("#cf").addEventListener("submit",order);
document.title=S.name+" | أعشاب ونباتات طبيعية";$("#logo").textContent=S.name;$("#fn").textContent=S.name;$("#hh").textContent=S.heroTitle;$("#ht").textContent=S.heroText;
var o=D.products.filter(offer);$("#offers").hidden=!o.length;$("#go").innerHTML=o.map(card).join("");
$("#about").hidden=!S.about;$("#ab").textContent=S.about||"";
var ct=[];if(S.phone)ct.push("الهاتف: "+esc(S.phone));if(S.address)ct.push("العنوان: "+esc(S.address));if(S.hours)ct.push("أوقات العمل: "+esc(S.hours));
[["facebook","فيسبوك"],["instagram","إنستجرام"]].forEach(function(k){if(/^https?:\/\//.test(S[k[0]]||""))ct.push('<a href="'+esc(S[k[0]])+'" target="_blank" rel="noopener noreferrer">'+k[1]+"</a>")});
var w=wa("مرحباً، أريد الاستفسار عن منتجاتكم.");if(w)ct.push('<a class="btn wa" href="'+w+'" target="_blank" rel="noopener noreferrer">راسلنا عبر واتساب</a>');
$("#cl2").innerHTML=ct.map(function(x){return"<p>"+x+"</p>"}).join("");
chips();list();badge();
})();
