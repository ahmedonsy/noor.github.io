/* طبقة البيانات: تحفظ في LocalStorage وتعود لبيانات js/data.js عند عدم وجود تعديلات */
var DB=(function(){
var K="mashtal_data_v2";
function clone(o){return JSON.parse(JSON.stringify(o))}
function refreshProductImages(d){
var paths={
"assets/images/products/moringa-dry.jpg":"assets/images/products/moringa-dry.png?v=25112026-4",
"assets/images/products/berry.jpg":"assets/images/products/berry.jpg?v=25112026-4"
};
d.products.forEach(function(p){if(Array.isArray(p.images))p.images=p.images.map(function(src){return paths[src]||src})});
return d
}
return{
 get:function(){try{var d=JSON.parse(localStorage.getItem(K));if(d&&Array.isArray(d.products)&&d.settings)return refreshProductImages(d)}catch(e){}return clone(window.SEED_DATA)},
 save:function(d){try{localStorage.setItem(K,JSON.stringify(d));return true}catch(e){alert("تعذر الحفظ: مساحة التخزين ممتلئة. احذف بعض الصور المرفوعة أو استخدم مسارات صور داخل المجلد.");return false}},
 reset:function(){try{localStorage.removeItem(K)}catch(e){}},
 valid:function(d){return d&&typeof d==="object"&&Array.isArray(d.products)&&Array.isArray(d.categories)&&d.settings&&typeof d.settings==="object"}
}})();
