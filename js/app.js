(function(){
"use strict";
var D=DB.get(),S=D.settings,$=function(s){return document.querySelector(s)},cat="",cart=[],CK="mashtal_cart_v1",lastFocus=null,currentModal=null,menuPreviousOverflow="";
function readPref(key,allowed,fallback){try{var value=localStorage.getItem(key);return allowed.indexOf(value)>-1?value:fallback}catch(e){return fallback}}
function writePref(key,value){try{localStorage.setItem(key,value)}catch(e){}}
var lang=readPref("mashtal_lang_v1",["ar","en"],"ar"),theme=readPref("mashtal_theme_v1",["garden","sunshine","ocean"],"garden"),branchId=readPref("mashtal_branch_v1",["taag-el-ezz","nasr-city"],null),fulfilment=readPref("mashtal_fulfilment_v1",["pickup","delivery"],"");
function locale(){return STORE_COPY[lang]}
function t(key){return locale().ui[key]||key}
function productCopy(p){return locale().products[p.id]||{name:p.name,desc:p.desc,benefits:[]}}
function pname(p){return productCopy(p).name}
function pdesc(p){return productCopy(p).desc}
function pbenefits(p){return productCopy(p).benefits||[]}
function cname(id){return locale().categories[id]||t("naturalProduct")}
function brandName(){return lang==="en"&&S.name===window.SEED_DATA.settings.name?locale().brand:S.name}
function branchName(id){return id==="taag-el-ezz"?t("branchTaagFull"):id==="nasr-city"?t("branchNasrFull"):""}
function branchStockStatus(p,id){var status=p&&p.branchStock&&p.branchStock[id];if(["available","limited","unavailable"].indexOf(status)>-1)return status;return p&&p.id==="lemon"&&id==="nasr-city"?"unavailable":"available"}
function productStockStatus(p,id){return p&&p.available===false?"unavailable":branchStockStatus(p,id)}
function availableAtBranch(p,id){return !!id&&!!p&&branchStockStatus(p,id)!=="unavailable"}
function branchProducts(){return D.products.filter(function(p){return availableAtBranch(p,branchId)})}
function renderBranch(){
 var name=branchId?branchName(branchId):t("branchChoose");
 $("#branch-toggle-label").textContent=branchId?t("branchLabel")+": "+(branchId==="taag-el-ezz"?t("branchTaagName"):t("branchNasrName")):t("branchChoose");
 $("#branch-toggle").setAttribute("aria-label",t("changeBranch")+(branchId?": "+name:""));
 $("#branch-overlay").hidden=!!branchId;
 $("#fab").hidden=!branchId;
}
function renderFulfilment(){
 var options=$("#fulfilment-choice").querySelectorAll('input[name="fulfilment"]');
 Array.prototype.forEach.call(options,function(input){input.checked=input.value===fulfilment});
 $("#address-group").hidden=fulfilment!=="delivery";
 var hint=$("#fulfilment-hint");
 hint.hidden=!fulfilment;
 hint.textContent=fulfilment==="delivery"?t("deliveryFeeNotice"):t("pickupAtBranch").replace("{branch}",branchName(branchId));
}
function chooseBranch(id){
 if(["taag-el-ezz","nasr-city"].indexOf(id)<0)return;
 if(branchId!==id&&cart.length){cart=[];saveCart()}
 branchId=id;writePref("mashtal_branch_v1",id);cat="";$("#q").value="";$("#clear-search").hidden=true;
 if(currentModal&&!availableAtBranch(find(currentModal),id)){$("#ov").hidden=true;currentModal=null}
 renderBranch();applyLanguage();closeMenu();$("#menu-toggle").focus()
}
function applyLanguage(){
 var c=locale(),nodes;
 document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.documentElement.setAttribute("data-theme",theme);
 document.title=c.title;var meta=$('#meta-description');if(meta)meta.content=c.description;
 nodes=document.querySelectorAll("[data-i18n]");Array.prototype.forEach.call(nodes,function(el){el.textContent=t(el.getAttribute("data-i18n"))});
 nodes=document.querySelectorAll("[data-i18n-placeholder]");Array.prototype.forEach.call(nodes,function(el){el.placeholder=t(el.getAttribute("data-i18n-placeholder"))});
 nodes=document.querySelectorAll("[data-i18n-aria]");Array.prototype.forEach.call(nodes,function(el){el.setAttribute("aria-label",t(el.getAttribute("data-i18n-aria")))});
 nodes=document.querySelectorAll("[data-i18n-alt]");Array.prototype.forEach.call(nodes,function(el){el.alt=t(el.getAttribute("data-i18n-alt"))});
 nodes=document.querySelectorAll("[data-direction-arrow]");Array.prototype.forEach.call(nodes,function(el){el.textContent=t("arrow")});
 nodes=document.querySelectorAll("[data-theme-label]");Array.prototype.forEach.call(nodes,function(el){el.textContent=c.themes[el.getAttribute("data-theme-label")]});
 $("#language-toggle").textContent=lang==="ar"?"EN":"عربي";$("#language-toggle").setAttribute("aria-label",t("switchLanguage"));
 $("#theme-switcher").value=theme;$("#logo").textContent=brandName();$("#fn").textContent=brandName();
 $("#hh").textContent=lang==="ar"?S.heroTitle:c.settings.heroTitle;$("#ht").textContent=lang==="ar"?S.heroText:c.settings.heroText;
 $("#ab").textContent=lang==="ar"?S.about:c.settings.about;
 var hw=$("#hero-wa"),heroUrl=wa(t("whatsappInquiry"));hw.hidden=!heroUrl;if(heroUrl)hw.href=heroUrl;
 renderBranch();renderFulfilment();renderContact();var deals=branchProducts().filter(offer);$("#offers").hidden=!deals.length;$("#go").innerHTML=deals.map(card).join("");$("#about").hidden=!S.about;
 chips();list();badge();lines();
 if(currentModal)show(currentModal)
}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function arrow(){return t("arrow")}
function egp(q){var v=q/100;return lang==="ar"?(v%1?v.toFixed(2):v)+" جنيه":"EGP "+(v%1?v.toFixed(2):v)}
function wl(g){return g>=1000?(g/1000)+" "+t("kilo"):g+" "+t("grams")}
function nz(s){return String(s).toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[\u064B-\u0652]/g,"")}
function find(id){return D.products.filter(function(p){return p.id===id})[0]}
function isKg(p){return p.sellBy==="kg"&&p.weights&&p.weights.length>0}
function up(p,g){return Math.round(Number(p.price)*100*(isKg(p)?g/1000:1))}
function offer(p){return Number(p.oldPrice)>Number(p.price)}
function img(p){return(p.images&&p.images[0])||"assets/icons/leaf.svg"}
function wa(t){var n=String(S.whatsapp||"").replace(/\D/g,"");return n?"https://wa.me/"+n+(t?"?text="+encodeURIComponent(t):""):""}
function delivery(){if(!fulfilment)return null;if(fulfilment==="pickup")return 0;return S.delivery===""||S.delivery==null||isNaN(Number(S.delivery))?null:Math.round(Number(S.delivery)*100)}
try{cart=JSON.parse(localStorage.getItem(CK))||[]}catch(e){cart=[]}
cart=cart.filter(function(c){var p=find(c.id);return p&&p.available!==false&&(!branchId||availableAtBranch(p,branchId))&&c.q>0&&(isKg(p)?p.weights.indexOf(c.g)>-1:c.g===0)});
function saveCart(){try{localStorage.setItem(CK,JSON.stringify(cart))}catch(e){}}
function wsel(p){return'<select class="w" aria-label="'+esc(t("selectWeight"))+'"><option value="">'+t("selectWeight")+"</option>"+p.weights.map(function(g){return'<option value="'+g+'">'+wl(g)+" – "+egp(up(p,g))+"</option>"}).join("")+"</select>"}
function ptxt(p){return'<div class="price">'+egp(Number(p.price)*100)+' <small>'+(isKg(p)?t("perKilo"):t("perContainer"))+"</small>"+(offer(p)?' <s>'+egp(Number(p.oldPrice)*100)+"</s>":"")+"</div>"}
function addBtn(p){var o=productStockStatus(p,branchId)==="unavailable";return'<button class="btn" data-add="'+esc(p.id)+'"'+(o?" disabled":"")+">"+(o?t("outOfStock"):t("addToCart"))+"</button>"}
function card(p){var copy=productCopy(p),benefits=pbenefits(p),stock=productStockStatus(p,branchId),tag=stock==="unavailable"?'<span class="tag off">'+t("outOfStock")+'</span>':stock==="limited"?'<span class="tag">'+t("limitedStock")+'</span>':offer(p)?'<span class="tag">'+t("offer")+'</span>':p.featured?'<span class="tag">'+t("featured")+'</span>':"";
 return'<article class="card"><button class="ph" data-id="'+esc(p.id)+'" aria-label="'+esc(t("details")+" "+copy.name)+'"><img src="'+esc(img(p))+'" width="400" height="400" alt="'+esc(copy.name)+'" loading="lazy" decoding="async">'+tag+'<span class="image-open" aria-hidden="true">'+t("showDetails")+'</span></button><div class="cb"><span class="product-category">'+esc(cname(p.cat))+'</span><h3>'+esc(copy.name)+'</h3><p class="product-desc">'+esc(copy.desc)+'</p>'+(benefits.length?'<p class="product-benefit">'+esc(benefits[0])+"</p>":"")+ptxt(p)+(isKg(p)?wsel(p):"")+'<div class="row2">'+addBtn(p)+'<button class="btn lt" data-id="'+esc(p.id)+'">'+t("details")+"</button></div></div></article>"}
function list(){var q=nz($("#q").value.trim());
 var l=branchProducts().filter(function(p){var ar=STORE_COPY.ar.products[p.id]||{},en=STORE_COPY.en.products[p.id]||{},search=p.name+" "+p.desc+" "+pname(p)+" "+pdesc(p)+" "+(ar.name||"")+" "+(ar.desc||"")+" "+(en.name||"")+" "+(en.desc||"");return(!cat||p.cat===cat)&&(!q||nz(search).indexOf(q)>-1)});
 $("#gp").innerHTML=l.map(card).join("");$("#empty").hidden=l.length>0;$("#result-count").textContent=t("resultCount").replace("{count}",l.length);$("#clear-search").hidden=!$("#q").value}
function chips(){$("#chips").innerHTML=[{id:"",name:t("all")}].concat(D.categories).map(function(c){return'<button class="chip" data-cat="'+esc(c.id)+'" aria-pressed="'+(c.id===cat)+'">'+esc(c.id?cname(c.id):c.name)+"</button>"}).join("")}
function show(id){var p=find(id);if(!p||!availableAtBranch(p,branchId))return;currentModal=id;var copy=productCopy(p),benefits=pbenefits(p),im=p.images&&p.images.length?p.images:["assets/icons/leaf.svg"],stock=productStockStatus(p,branchId);
 $("#md").innerHTML='<button class="x" data-close aria-label="'+t("close")+'">✕</button><img class="main" id="mi" src="'+esc(im[0])+'" width="560" height="560" alt="'+esc(copy.name)+'" decoding="async">'+(im.length>1?'<div class="th">'+im.map(function(s){return'<img data-src="'+esc(s)+'" src="'+esc(s)+'" width="56" height="56" alt="" loading="lazy" decoding="async">'}).join("")+"</div>":"")+"<h2>"+esc(copy.name)+"</h2><p class=\"note\">"+esc(cname(p.cat))+"</p>"+ptxt(p)+"<p>"+esc(copy.desc)+"</p>"+(benefits.length?'<h3 class="benefits-heading">'+t("benefitsTitle")+'</h3><ul class="benefit-list">'+benefits.map(function(b){return"<li>"+esc(b)+"</li>"}).join("")+"</ul>":"")+'<p>'+t("status")+': <b>'+(stock==="unavailable"?t("outOfStock"):stock==="limited"?t("limitedStock"):t("available"))+"</b></p>"+(isKg(p)?wsel(p):"")+'<div class="row2">'+addBtn(p)+"</div>";
 $("#ov").hidden=false}
function lines(){var sub=0,h="";
 if(!cart.length){$("#cl").innerHTML='<div class="cart-empty"><span class="empty-icon" aria-hidden="true">🛍</span><h3>'+t("cartEmptyTitle")+'</h3><p>'+t("cartEmptyText")+'</p><a class="btn" href="#products" data-close-cart>'+t("browseProducts")+' <span aria-hidden="true">'+arrow()+"</span></a></div>";$("#ck").hidden=true;return}
 cart.forEach(function(c,i){var p=find(c.id),u=up(p,c.g);sub+=u*c.q;h+='<div class="ln"><div class="cart-product"><img src="'+esc(img(p))+'" alt=""><div><b>'+esc(pname(p))+'</b><span class="note">'+(c.g?t("weight")+": "+wl(c.g):t("unit")+": "+t("perContainer"))+'</span></div></div><div class="r"><span class="st"><button data-dec="'+i+'" aria-label="'+t("decrease")+'">−</button><span>'+c.q+'</span><button data-inc="'+i+'" aria-label="'+t("increase")+'">+</button></span><b>'+egp(u*c.q)+'</b><button class="sm" data-rm="'+i+'">'+t("delete")+'</button></div></div>'});
 var dv=delivery(),deliveryText=fulfilment==="pickup"?t("pickupNoFee"):!fulfilment?t("chooseFulfilment"):dv==null?t("confirmDelivery"):egp(dv);$("#cl").innerHTML=h;$("#ck").hidden=false;
 $("#cl").insertAdjacentHTML("afterbegin",'<p class="branch-cart-note"><b>'+t("branchLabel")+":</b> "+esc(branchName(branchId))+"</p>");
 $("#tt").innerHTML="<div><span>"+t("subtotal")+"</span><span>"+egp(sub)+"</span></div><div><span>"+t("deliveryFeeLabel")+"</span><span>"+deliveryText+'</span></div><div class="t"><span>'+t("total")+(dv==null?" ("+t("withoutDelivery")+")":"")+"</span><span>"+egp(sub+(dv||0))+"</span></div>";
 return sub}
function badge(){$("#cnt").textContent=cart.reduce(function(a,c){return a+c.q},0)}
function upd(){saveCart();badge();lines()}
function add(p,g){if(productStockStatus(p,branchId)==="unavailable"||!availableAtBranch(p,branchId))return;var k=cart.filter(function(c){return c.id===p.id&&c.g===g})[0];if(k)k.q=Math.min(99,k.q+1);else cart.push({id:p.id,g:g,q:1});upd();var f=$("#fab");f.animate([{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:300})}
function openCart(){lastFocus=document.activeElement;lines();$("#cv").classList.add("on");document.body.style.overflow="hidden";$("[data-close-cart].x").focus()}
function closeCart(){$("#cv").classList.remove("on");document.body.style.overflow="";if(lastFocus)lastFocus.focus()}
function openMenu(){menuPreviousOverflow=document.body.style.overflow;$("#menu-overlay").hidden=false;document.body.style.overflow="hidden";$("#menu-toggle").setAttribute("aria-expanded","true");$("#menu-close").focus()}
function closeMenu(restoreFocus){if($("#menu-overlay").hidden)return;$("#menu-overlay").hidden=true;document.body.style.overflow=menuPreviousOverflow;$("#menu-toggle").setAttribute("aria-expanded","false");if(restoreFocus!==false)$("#menu-toggle").focus()}
function order(e){e.preventDefault();var er=$("#er"),n=$("#cn").value.trim(),ph=$("#cp").value.replace(/[\s-]/g,""),a=$("#ca").value.trim(),o=$("#co").value.trim();
 if(!branchId){er.textContent=t("branchRequired");return}
 if(!cart.length){er.textContent=t("errorCart");return}
 if(cart.some(function(c){var p=find(c.id);return productStockStatus(p,branchId)==="unavailable"||!availableAtBranch(p,branchId)})){er.textContent=t("branchCartError");return}
 if(!fulfilment){er.textContent=t("errorFulfilment");return}
 if(!n){er.textContent=t("errorName");return}
 if(!/^(\+?20|0)1[0125]\d{8}$/.test(ph)){er.textContent=t("errorPhone");return}
 if(fulfilment==="delivery"&&a.length<5){er.textContent=t("errorAddress");return}
 if(!wa()){er.textContent=t("errorWhatsapp");return}
 er.textContent="";var sub=0,m=[t("orderIntro").replace("{name}",brandName()),t("orderBranch")+": "+branchName(branchId),t("fulfilmentLabel")+": "+t(fulfilment)];
 if(fulfilment==="delivery")m.push(t("customerAddress")+" "+a,t("deliveryFeeNotice"));
 else m.push(t("pickupAtBranch").replace("{branch}",branchName(branchId)));
 m.push("",""+t("customerDetails"),t("customerName")+" "+n,t("customerPhone")+" "+ph);if(o)m.push(t("customerNotes")+" "+o);m.push("",""+t("orderDetails"));
 cart.forEach(function(c,i){var p=find(c.id),u=up(p,c.g);sub+=u*c.q;m.push("",""+(i+1)+". "+pname(p),c.g?t("weightPrefix")+" "+wl(c.g):t("unitPrefix")+" "+t("perContainer"),t("quantity")+" "+c.q,t("unitPrice")+" "+egp(u),t("lineTotal")+" "+egp(u*c.q))});
 var dv=delivery(),feeText=fulfilment==="pickup"?t("pickupNoFee"):dv==null?t("confirmDelivery"):egp(dv);m.push("",""+t("subtotalPrefix")+" "+egp(sub),t("deliveryPrefix")+" "+feeText,t("finalTotal")+" "+egp(sub+(dv||0))+(dv==null?" ("+t("withoutDelivery")+")":""),"",t("priceConfirmationNotice"),"",t("thanks"));
 var u=wa(m.join("\n")),l=document.createElement("a");l.href=u;l.target="_blank";l.rel="noopener noreferrer";document.body.appendChild(l);l.click();l.remove();
 $("#nt").innerHTML=t("orderReady")+' <a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">'+t("here")+"</a>."}
document.addEventListener("click",function(e){var t=e.target,b;
 if(t.closest("#menu-toggle")){openMenu();return}
 if(t.closest("[data-close-menu]")){closeMenu();return}
 if(t.closest("#site-navigation a")){closeMenu(false);return}
 if((b=t.closest("[data-branch]"))){chooseBranch(b.dataset.branch);return}
 if(t.closest("#branch-toggle")){$("#branch-overlay").hidden=false;$("#branch-overlay [data-branch]").focus();return}
 if((b=t.closest("[data-add]"))){var p=find(b.dataset.add),box=b.closest(".card,#md"),s=box.querySelector("select.w"),g=0;
  if(isKg(p)){g=s?+s.value:0;if(!g){s.classList.add("bad");s.focus();return}s.classList.remove("bad")}add(p,g);return}
 if(t.closest("[data-reset-search]")){cat="";$("#q").value="";$("#clear-search").hidden=true;chips();list();return}
 if((b=t.closest("[data-cat]"))){cat=b.dataset.cat;chips();list();return}
 if((b=t.closest("[data-id]"))){show(b.dataset.id);return}
 if(t.closest("[data-close]")||t.id==="ov"){$("#ov").hidden=true;currentModal=null;return}
 if((b=t.closest("[data-src]"))){$("#mi").src=b.dataset.src;return}
 if(t.closest("[data-cart]")){openCart();return}
 if(t.closest("[data-close-cart]")){closeCart();return}
 if((b=t.closest("[data-inc]"))){var c=cart[+b.dataset.inc];c.q=Math.min(99,c.q+1);upd();return}
 if((b=t.closest("[data-dec]"))){var d=cart[+b.dataset.dec];d.q--;if(d.q<1)cart.splice(+b.dataset.dec,1);upd();return}
 if((b=t.closest("[data-rm]"))){cart.splice(+b.dataset.rm,1);upd();return}
 if(t.closest("[data-clear]")){cart=[];upd();return}});
document.addEventListener("keydown",function(e){
 if(!$("#branch-overlay").hidden){
  if(e.key==="Escape"){e.preventDefault();return}
  if(e.key==="Tab"){
   var choices=Array.prototype.slice.call($("#branch-overlay").querySelectorAll("[data-branch]")),i=choices.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();choices[choices.length-1].focus()}
   else if(!e.shiftKey&&i===choices.length-1){e.preventDefault();choices[0].focus()}
  }
  return
 }
 if(!$("#menu-overlay").hidden){
  if(e.key==="Escape"){e.preventDefault();closeMenu();return}
  if(e.key==="Tab"){
   var focusables=Array.prototype.filter.call($("#side-menu").querySelectorAll('a[href],button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled])'),function(el){return el.getClientRects().length}),i=focusables.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();focusables[focusables.length-1].focus()}
   else if(!e.shiftKey&&i===focusables.length-1){e.preventDefault();focusables[0].focus()}
  }
  return
 }
 if(e.key==="Escape"){$("#ov").hidden=true;currentModal=null;if($("#cv").classList.contains("on"))closeCart()}
});
function renderContact(){var ct=[],facebookUrl=S.facebook||window.SEED_DATA.settings.facebook,facebookLink=$("#footer-facebook");facebookLink.hidden=!/^https?:\/\//.test(facebookUrl||"");if(!facebookLink.hidden)facebookLink.href=facebookUrl;if(S.phone)ct.push('<a class="contact-detail" href="tel:'+esc(S.phone)+'"><span class="contact-icon" aria-hidden="true">☎</span><span><small>'+t("contactCall")+'</small><b>'+esc(S.phone)+'</b></span></a>');if(S.address)ct.push('<div class="contact-detail"><span class="contact-icon" aria-hidden="true">⌖</span><span><small>'+t("contactAddress")+'</small><b>'+esc(S.address)+'</b></span></div>');if(S.hours)ct.push('<div class="contact-detail"><span class="contact-icon" aria-hidden="true">◷</span><span><small>'+t("contactHours")+'</small><b>'+esc(S.hours)+'</b></span></div>');
 [["instagram",S.instagram]].forEach(function(k){if(/^https?:\/\//.test(k[1]||""))ct.push('<a class="social-link" href="'+esc(k[1])+'" target="_blank" rel="noopener noreferrer">'+t(k[0])+' <span aria-hidden="true">↗</span></a>')});
 var w=wa(t("whatsappInquiry"));if(w)ct.push('<a class="btn wa contact-wa" href="'+esc(w)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◉</span> '+t("askWhatsapp")+' <span aria-hidden="true">'+arrow()+"</span></a>");
 $("#cl2").innerHTML=ct.join("")}
$("#q").addEventListener("input",list);$("#clear-search").addEventListener("click",function(){$("#q").value="";this.hidden=true;$("#q").focus();list()});$("#cf").addEventListener("submit",order);
$("#fulfilment-choice").addEventListener("change",function(e){var input=e.target.closest('input[name="fulfilment"]');if(!input)return;fulfilment=input.value;writePref("mashtal_fulfilment_v1",fulfilment);renderFulfilment();lines()});
$("#language-toggle").addEventListener("click",function(){var y=window.pageYOffset;lang=lang==="ar"?"en":"ar";writePref("mashtal_lang_v1",lang);applyLanguage();$("nav").scrollLeft=0;window.scrollTo(0,y)});
$("#theme-switcher").addEventListener("change",function(){theme=this.value;writePref("mashtal_theme_v1",theme);document.documentElement.setAttribute("data-theme",theme)});
var beeTrigger=$("#bee-flight-trigger"),heroVisual=$(".hero-visual");
beeTrigger.addEventListener("click",function(){
 if(heroVisual.classList.contains("bee-flight-running"))return;
 heroVisual.classList.add("bee-flight-running")
});
beeTrigger.addEventListener("animationend",function(e){
 if(e.animationName==="bee-flight")heroVisual.classList.remove("bee-flight-running")
});
applyLanguage();
if(!branchId)$("#branch-overlay [data-branch]").focus();
})();
