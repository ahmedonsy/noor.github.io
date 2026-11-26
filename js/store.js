(function(){
var D=DB.get(),S=D.settings,$=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function money(n){n=Number(n);return(n%1?n.toFixed(2):n)+" جنيه"}
function img(p){return(p.images&&p.images[0])||"assets/icons/leaf.svg"}
function wa(t){var n=String(S.whatsapp||"").replace(/\D/g,"");return n?"https://wa.me/"+n+(t?"?text="+encodeURIComponent(t):""):""}
function find(id){return D.products.filter(function(p){return p.id===id})[0]}
function isOffer(p){return Number(p.oldPrice)>Number(p.price)}
function card(p){var tag=p.available===false?'<span class="tag off">غير متاح</span>':isOffer(p)?'<span class="tag">عرض</span>':p.featured?'<span class="tag">مميز</span>':"";
 return'<article class="card"><button class="ph" data-id="'+esc(p.id)+'" aria-label="تفاصيل '+esc(p.name)+'"><img src="'+esc(img(p))+'" alt="'+esc(p.name)+'" loading="lazy">'+tag+'</button><div class="cb"><h3>'+esc(p.name)+'</h3><div class="price">'+money(p.price)+(isOffer(p)?' <s>'+money(p.oldPrice)+'</s>':"")+' <small>'+esc(p.unit)+'</small></div><button class="btn" data-id="'+esc(p.id)+'">التفاصيل</button></div></article>'}
function list(){var q=$("#q").value.trim(),c=$("#cat").value,s=$("#sort").value;
 var l=D.products.filter(function(p){return(!c||p.cat===c)&&(!q||(p.name+" "+p.desc).indexOf(q)>-1)});
 l.sort(function(a,b){return s==="asc"?a.price-b.price:s==="desc"?b.price-a.price:(b.created||0)-(a.created||0)});
 $("#gp").innerHTML=l.map(card).join("");$("#empty").hidden=l.length>0}
function show(id){var p=find(id);if(!p)return;var im=p.images&&p.images.length?p.images:["assets/icons/leaf.svg"];
 var c=D.categories.filter(function(x){return x.id===p.cat})[0],w=wa("مرحباً، أريد الاستفسار عن/طلب: "+p.name+". يرجى تأكيد السعر النهائي من المتجر.");
 $("#md").innerHTML='<button class="x" data-close aria-label="إغلاق">✕</button><img class="main" id="mi" src="'+esc(im[0])+'" alt="'+esc(p.name)+'">'+(im.length>1?'<div class="th">'+im.map(function(s){return'<img data-src="'+esc(s)+'" src="'+esc(s)+'" alt="">'}).join("")+"</div>":"")+'<h2>'+esc(p.name)+'</h2>'+(c?'<p class="note">'+esc(c.name)+'</p>':"")+'<div class="price">'+money(p.price)+(isOffer(p)?' <s>'+money(p.oldPrice)+'</s>':"")+' <small>'+esc(p.unit)+'</small></div><p>'+esc(p.desc)+'</p><p>الحالة: <b>'+(p.available===false?"غير متاح حاليًا":"متاح")+'</b>'+(p.qty!==""&&p.qty!=null&&p.available!==false?" · الكمية المتاحة: "+esc(p.qty):"")+'</p>'+(w&&p.available!==false?'<a class="btn wa" target="_blank" rel="noopener noreferrer" href="'+w+'">اطلب عبر واتساب</a>':"");
 $("#ov").hidden=false}
function init(){document.title=S.name+" | أعشاب ونباتات طبيعية";$("#logo").textContent=S.name;$("#fn").textContent=S.name;
 $("#hh").textContent=S.heroTitle;$("#ht").textContent=S.heroText;
 $("#cat").innerHTML='<option value="">كل التصنيفات</option>'+D.categories.map(function(c){return'<option value="'+esc(c.id)+'">'+esc(c.name)+"</option>"}).join("");
 var f=D.products.filter(function(p){return p.featured}),o=D.products.filter(isOffer);
 $("#featured").hidden=!f.length;$("#gf").innerHTML=f.map(card).join("");
 $("#offers").hidden=!o.length;$("#go").innerHTML=o.map(card).join("");
 var g=[];D.products.forEach(function(p){(p.images||[]).forEach(function(s){g.push('<img src="'+esc(s)+'" data-id="'+esc(p.id)+'" alt="'+esc(p.name)+'" loading="lazy">')})});
 $("#gallery").hidden=!g.length;$("#gg").innerHTML=g.join("");
 $("#about").hidden=!S.about;$("#ab").textContent=S.about||"";
 var c=[];if(S.phone)c.push("الهاتف: "+esc(S.phone));if(S.address)c.push("العنوان: "+esc(S.address));if(S.hours)c.push("أوقات العمل: "+esc(S.hours));
 [["facebook","فيسبوك"],["instagram","إنستجرام"]].forEach(function(k){if(/^https?:\/\//.test(S[k[0]]||""))c.push('<a href="'+esc(S[k[0]])+'" target="_blank" rel="noopener noreferrer">'+k[1]+"</a>")});
 $("#cl").innerHTML=c.map(function(x){return"<p>"+x+"</p>"}).join("")||'<p class="note">تواصل معنا عبر واتساب.</p>';
 var w=wa("مرحباً، أريد الاستفسار عن منتجاتكم.");$("#cwa").hidden=!w;if(w)$("#cwa").href=w;
 list()}
document.addEventListener("click",function(e){var t=e.target;
 if(t.closest("[data-close]")||t.id==="ov"){$("#ov").hidden=true;return}
 var th=t.closest("[data-src]");if(th){$("#mi").src=th.dataset.src;return}
 var b=t.closest("[data-id]");if(b)show(b.dataset.id)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")$("#ov").hidden=true});
["#q","#cat","#sort"].forEach(function(s){$(s).addEventListener("input",list)});
init();
})();
