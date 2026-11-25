import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const ADMIN_KEY = "mashtal_admin";
const AUTH_KEY = "mashtal_auth";
const TABS = [
  ["products", "المنتجات", "▤"],
  ["cats", "التصنيفات", "◈"],
  ["set", "الرئيسية والتواصل", "⌂"],
  ["bak", "النسخ الاحتياطي", "↥"],
];
const SETTINGS_FIELDS = [
  ["name", "اسم المشتل"],
  ["heroTitle", "عنوان الصفحة الرئيسية"],
  ["heroText", "وصف الصفحة الرئيسية", true],
  ["about", "نبذة عن المشتل", true],
  ["delivery", "سعر التوصيل بالجنيه (اتركه فارغًا إن كان يُحدد عند تأكيد الطلب)"],
  ["whatsapp", "رقم واتساب (صيغة دولية دون +، مثل 201001234567)"],
  ["phone", "رقم الهاتف"],
  ["address", "العنوان"],
  ["hours", "أوقات العمل"],
  ["facebook", "رابط فيسبوك"],
  ["instagram", "رابط إنستجرام"],
];

function hashPassword(value) {
  if (window.crypto && window.crypto.subtle) {
    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(value))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
      );
  }
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 33) ^ value.charCodeAt(i);
  return Promise.resolve(`x${hash >>> 0}`);
}

function createId() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذرت قراءة الصورة."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("ملف الصورة غير صالح."));
      image.onload = () => {
        const scale = Math.min(1, 800 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("تعذر معالجة الصورة."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function saveDownload(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const hasPassword = Boolean(localStorage.getItem(ADMIN_KEY));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!hasPassword && password.length < 6) {
      setError("كلمة المرور أقصر من 6 أحرف.");
      return;
    }
    setBusy(true);
    try {
      const digest = await hashPassword(password);
      if (hasPassword && digest !== localStorage.getItem(ADMIN_KEY)) {
        setError("كلمة المرور غير صحيحة.");
        return;
      }
      if (!hasPassword) localStorage.setItem(ADMIN_KEY, digest);
      sessionStorage.setItem(AUTH_KEY, "1");
      onLogin();
    } catch (error) {
      setError("تعذر التحقق من كلمة المرور. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <a className="login-brand" href="index.html">جنة الرحمن</a>
      <section className="login-card">
        <div className="login-mark" aria-hidden="true"><img src="assets/images/banners/MyLogo.png" alt="" /></div>
        <p className="eyebrow">إدارة المتجر</p>
        <h1>مرحبًا بعودتك</h1>
        <p className="login-copy">
          {hasPassword ? "أدخل كلمة المرور لفتح لوحة التحكم." : "أنشئ كلمة مرور من 6 أحرف على الأقل للبدء."}
        </p>
        <form onSubmit={submit}>
          <label htmlFor="admin-password">كلمة المرور</label>
          <input
            autoFocus
            autoComplete={hasPassword ? "current-password" : "new-password"}
            id="admin-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <p className="err" role="alert">{error}</p>
          <button className="btn login-submit" disabled={busy} type="submit">
            {busy ? "جارٍ التحقق..." : hasPassword ? "دخول إلى اللوحة" : "إنشاء كلمة المرور"}
          </button>
        </form>
        <a className="back-link" href="index.html">العودة إلى المتجر ←</a>
      </section>
      <p className="login-footnote">لوحة خاصة بإدارة متجر جنة الرحمن</p>
    </main>
  );
}

function ProductForm({ product, categories, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => ({
    name: "",
    cat: "",
    desc: "",
    price: "",
    oldPrice: "",
    sellBy: "unit",
    weightsText: (product?.weights || []).join(", "),
    unit: "",
    qty: "",
    available: true,
    featured: false,
    images: [],
    ...product,
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef(null);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function addImages(files) {
    if (!files.length) return;
    setError("");
    setBusy(true);
    try {
      const images = await Promise.all(Array.from(files, readImage));
      setDraft((current) => ({ ...current, images: [...current.images, ...images] }));
    } catch (imageError) {
      setError(imageError.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addImagePath() {
    const path = draft.imagePath?.trim() || "";
    if (!/^[\w\-./]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(path) || path.includes("..") || path.startsWith("/")) {
      setError("مسار غير صالح. استخدم مسارًا نسبيًا داخل المشروع، مثل assets/images/products/name.jpg");
      return;
    }
    update("images", [...draft.images, path]);
    update("imagePath", "");
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    const name = draft.name.trim();
    const price = Number(draft.price);
    const oldPrice = draft.oldPrice === "" ? "" : Number(draft.oldPrice);
    const quantity = draft.qty === "" ? "" : Number(draft.qty);
    if (!name) return setError("اكتب اسم المنتج.");
    if (draft.price === "" || !Number.isFinite(price) || price < 0) return setError("اكتب سعرًا صحيحًا.");
    if (oldPrice !== "" && (!Number.isFinite(oldPrice) || oldPrice < 0)) return setError("السعر قبل الخصم غير صحيح.");
    if (quantity !== "" && (!Number.isInteger(quantity) || quantity < 0)) return setError("الكمية غير صحيحة.");

    let weights = draft.weightsText.split(/[,،\s]+/).filter(Boolean).map(Number);
    if (draft.sellBy === "kg") {
      if (!weights.length || weights.some((weight) => !Number.isInteger(weight) || weight < 1 || weight > 100000)) {
        return setError("اكتب أوزانًا صحيحة بالجرام مفصولة بفواصل.");
      }
      weights = weights.sort((a, b) => a - b);
    } else {
      weights = [];
    }
    setError("");
    onSave({
      ...product,
      id: product?.id || createId(),
      created: product?.created || Date.now(),
      name,
      cat: draft.cat,
      desc: draft.desc.trim(),
      price,
      oldPrice,
      sellBy: draft.sellBy,
      weights,
      unit: draft.sellBy === "kg" ? "للكيلو" : draft.unit.trim() || "للقطعة",
      qty: quantity,
      available: draft.available,
      featured: draft.featured,
      images: draft.images.slice(),
    });
  }

  return (
    <form className="editor" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <button className="back-button" onClick={onCancel} type="button">← العودة إلى المنتجات</button>
          <p className="eyebrow">{product?.id ? "تحديث بيانات المنتج" : "إضافة إلى المتجر"}</p>
          <h2>{product?.id ? "تعديل المنتج" : "منتج جديد"}</h2>
        </div>
      </div>
      <div className="editor-grid">
        <section className="editor-card">
          <h3>معلومات المنتج</h3>
          <div className="field-grid">
            <label className="field">اسم المنتج<input autoFocus onChange={(event) => update("name", event.target.value)} value={draft.name} /></label>
            <label className="field">التصنيف
              <select onChange={(event) => update("cat", event.target.value)} value={draft.cat}>
                <option value="">بدون تصنيف</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="field full">الوصف<textarea onChange={(event) => update("desc", event.target.value)} rows="4" value={draft.desc} /></label>
            <label className="field">السعر بالجنيه<input min="0" onChange={(event) => update("price", event.target.value)} step="0.01" type="number" value={draft.price} /></label>
            <label className="field">السعر قبل الخصم (اختياري)<input min="0" onChange={(event) => update("oldPrice", event.target.value)} step="0.01" type="number" value={draft.oldPrice} /></label>
            <label className="field">طريقة البيع
              <select onChange={(event) => update("sellBy", event.target.value)} value={draft.sellBy}>
                <option value="unit">بالعبوة أو القطعة</option>
                <option value="kg">بالوزن (سعر الكيلو)</option>
              </select>
            </label>
            {draft.sellBy === "kg" && <label className="field">الأوزان المتاحة بالجرام<input onChange={(event) => update("weightsText", event.target.value)} placeholder="100، 200، 500، 1000" value={draft.weightsText} /></label>}
            {draft.sellBy === "unit" && <label className="field">وحدة البيع<input onChange={(event) => update("unit", event.target.value)} placeholder="للقطعة أو للعلبة" value={draft.unit} /></label>}
            <label className="field">الكمية المتاحة (اختياري)<input min="0" onChange={(event) => update("qty", event.target.value)} step="1" type="number" value={draft.qty} /></label>
          </div>
          <div className="switch-row">
            <label><input checked={draft.available} onChange={(event) => update("available", event.target.checked)} type="checkbox" /> متوفر</label>
            <label><input checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /> منتج مميز</label>
          </div>
        </section>
        <section className="editor-card">
          <h3>صور المنتج</h3>
          <p className="muted">الصورة الأولى هي الصورة الرئيسية. اختر الصور من جهازك أو أضف مسارًا من ملفات الموقع.</p>
          <div className="image-list">
            {draft.images.map((image, index) => (
              <div className="image-item" key={`${image}-${index}`}>
                <img alt={`صورة المنتج ${index + 1}`} src={image} />
                <button aria-label={`حذف الصورة ${index + 1}`} onClick={() => update("images", draft.images.filter((_, itemIndex) => itemIndex !== index))} type="button">×</button>
              </div>
            ))}
            {!draft.images.length && <span className="empty-images">لا توجد صور مضافة بعد</span>}
          </div>
          <input accept="image/*" className="file-input" multiple onChange={(event) => addImages(event.currentTarget.files)} ref={fileInput} type="file" />
          <div className="path-field">
            <label className="field">أو مسار صورة داخل المشروع<input onChange={(event) => update("imagePath", event.target.value)} placeholder="assets/images/products/name.jpg" value={draft.imagePath || ""} /></label>
            <button className="button button-outline" onClick={addImagePath} type="button">إضافة المسار</button>
          </div>
          <p className="muted image-tip">لأفضل أداء، ضع الصور في assets/images/products واستخدم مسارها بدل رفع صور كبيرة.</p>
        </section>
      </div>
      <p className="err form-error" role="alert">{error}</p>
      <div className="form-actions">
        <button className="btn" disabled={busy} type="submit">{busy ? "جارٍ تجهيز الصور..." : "حفظ المنتج"}</button>
        <button className="button button-outline" onClick={onCancel} type="button">إلغاء</button>
      </div>
    </form>
  );
}

function Products({ data, onEdit, onSave, onChange }) {
  const [editing, setEditing] = useState(null);
  const categoryName = (id) => data.categories.find((category) => category.id === id)?.name || "—";

  if (editing) {
    return <ProductForm
      categories={data.categories}
      onCancel={() => setEditing(null)}
      onSave={(product) => { onSave(product); setEditing(null); }}
      product={editing === "new" ? null : editing}
    />;
  }

  function remove(product) {
    if (!window.confirm("حذف هذا المنتج نهائيًا؟")) return;
    onChange({ ...data, products: data.products.filter((item) => item.id !== product.id) }, "تم الحذف");
  }

  function toggle(product) {
    const updated = { ...product, available: product.available === false };
    onChange({ ...data, products: data.products.map((item) => item.id === product.id ? updated : item) }, updated.available ? "أصبح المنتج متوفرًا" : "أصبح المنتج نافدًا");
  }

  return (
    <section className="content-card">
      <div className="section-heading">
        <div><p className="eyebrow">كتالوج المتجر</p><h2>المنتجات <span className="count-pill">{data.products.length}</span></h2></div>
        <button className="btn" onClick={() => setEditing("new")} type="button"><span aria-hidden="true">＋</span> إضافة منتج</button>
      </div>
      {!data.products.length ? <div className="empty-state"><span>✿</span><h3>لم تضف أي منتجات بعد</h3><p>ابدأ بإضافة أول منتج ليظهر في متجرك.</p><button className="btn" onClick={() => setEditing("new")} type="button">إضافة أول منتج</button></div> :
        <div className="table-scroll"><table className="product-table">
          <thead><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>الكمية</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>{data.products.map((product) => (
            <tr key={product.id}>
              <td><div className="product-cell"><img alt="" src={(product.images || [])[0] || "assets/icons/leaf.svg"} /><span><b>{product.name}{product.featured && <span className="featured-star" title="منتج مميز"> ★</span>}</b><small>{product.sellBy === "kg" ? "بالوزن" : product.unit || "بالقطعة"}</small></span></div></td>
              <td>{categoryName(product.cat)}</td>
              <td><b>{product.price}</b> <small>جنيه</small></td>
              <td>{product.qty === "" || product.qty == null ? "غير محدد" : product.qty}</td>
              <td><span className={`status ${product.available === false ? "status-off" : ""}`}><i />{product.available === false ? "غير متاح" : "متاح"}</span></td>
              <td><div className="table-actions">
                <button className="icon-button" onClick={() => setEditing(product)} type="button">تعديل</button>
                <button className="icon-button" onClick={() => toggle(product)} type="button">{product.available === false ? "تفعيل" : "نفاد"}</button>
                <button className="icon-button danger" onClick={() => remove(product)} type="button">حذف</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>}
    </section>
  );
}

function Categories({ data, onChange }) {
  const [categories, setCategories] = useState(data.categories);
  const [newName, setNewName] = useState("");

  function add() {
    const name = newName.trim();
    if (!name) return;
    const category = { id: createId(), name };
    const next = [...categories, category];
    setCategories(next);
    setNewName("");
    onChange({ ...data, categories: [...data.categories, category] });
  }

  function remove(index) {
    if (!window.confirm("حذف التصنيف؟ ستصبح منتجاته بدون تصنيف.")) return;
    const category = categories[index];
    const next = categories.filter((_, itemIndex) => itemIndex !== index);
    setCategories(next);
    onChange({
      ...data,
      categories: data.categories.filter((item) => item.id !== category.id),
      products: data.products.map((product) => product.cat === category.id ? { ...product, cat: "" } : product),
    });
  }

  function save() {
    onChange({ ...data, categories: categories.map((category) => ({ ...category, name: category.name.trim() })) }, "تم حفظ التصنيفات");
  }

  return <section className="content-card">
    <div className="section-heading"><div><p className="eyebrow">تنظيم المنتجات</p><h2>التصنيفات</h2></div></div>
    <div className="category-list">
      {!categories.length && <p className="muted">لا توجد تصنيفات. أضف تصنيفًا لتنظيم المنتجات.</p>}
      {categories.map((category, index) => <div className="category-row" key={category.id}>
        <span className="category-icon">◈</span>
        <input aria-label="اسم التصنيف" onChange={(event) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} value={category.name} />
        <button aria-label={`حذف ${category.name}`} className="icon-button danger" onClick={() => remove(index)} type="button">حذف</button>
      </div>)}
    </div>
    <div className="add-category"><input aria-label="تصنيف جديد" onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder="اكتب اسم تصنيف جديد" value={newName} /><button className="button button-outline" onClick={add} type="button">＋ إضافة</button></div>
    <div className="form-actions"><button className="btn" onClick={save} type="button">حفظ التصنيفات</button></div>
  </section>;
}

function Settings({ data, onChange }) {
  const [settings, setSettings] = useState(data.settings);
  const [error, setError] = useState("");

  function save() {
    if (!settings.name?.trim()) return setError("اسم المشتل مطلوب.");
    if (settings.whatsapp && !/^\d{10,15}$/.test(settings.whatsapp.trim())) return setError("رقم واتساب يجب أن يكون أرقامًا فقط بصيغة دولية دون +.");
    if (settings.delivery && (!Number.isFinite(Number(settings.delivery)) || Number(settings.delivery) < 0)) return setError("سعر التوصيل يجب أن يكون رقمًا صحيحًا.");
    for (const key of ["facebook", "instagram"]) {
      if (settings[key] && !/^https?:\/\//i.test(settings[key].trim())) return setError("يجب أن يبدأ رابط فيسبوك وإنستجرام بـ https:// أو http://.");
    }
    setError("");
    onChange({
      ...data,
      settings: {
        ...data.settings,
        ...settings,
        name: settings.name.trim(),
        whatsapp: settings.whatsapp.trim(),
        delivery: settings.delivery === "" ? "" : Number(settings.delivery),
      },
    }, "تم حفظ الإعدادات");
  }

  return <section className="content-card">
    <div className="section-heading"><div><p className="eyebrow">مظهر المتجر ومعلوماته</p><h2>الصفحة الرئيسية والتواصل</h2></div></div>
    <div className="settings-grid">
      {SETTINGS_FIELDS.map(([key, label, multiline]) => <label className={`field ${multiline ? "full" : ""}`} key={key}>{label}
        {multiline
          ? <textarea onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} rows="3" value={settings[key] || ""} />
          : <input onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} type={key === "delivery" ? "number" : "text"} value={settings[key] ?? ""} />}
      </label>)}
    </div>
    <p className="err form-error" role="alert">{error}</p>
    <div className="form-actions"><button className="btn" onClick={save} type="button">حفظ التغييرات</button></div>
  </section>;
}

function Backup({ data, onChange, onReset }) {
  const importInput = useRef(null);
  const [error, setError] = useState("");

  function exportBackup() {
    saveDownload(`backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
  }

  function exportData() {
    saveDownload("data.js", `window.SEED_DATA=${JSON.stringify(data, null, 1)};\n`, "text/javascript");
  }

  async function importBackup(file) {
    if (!file) return;
    setError("");
    try {
      const contents = await file.text();
      const imported = JSON.parse(contents);
      if (!window.DB.valid(imported)) throw new Error("invalid");
      if (!window.confirm("سيتم استبدال بياناتك الحالية. متابعة؟")) return;
      onChange(imported, "تم استيراد النسخة الاحتياطية");
    } catch (importError) {
      setError("الملف غير صالح كنسخة احتياطية.");
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  }

  function reset() {
    if (!window.confirm("حذف كل تعديلاتك والرجوع للبيانات الأصلية؟")) return;
    onReset();
  }

  return <section className="content-card">
    <div className="section-heading"><div><p className="eyebrow">حماية بيانات متجرك</p><h2>النسخ الاحتياطي والنشر</h2></div><span className="backup-mark">↥</span></div>
    <div className="notice-card"><span>ⓘ</span><p>تُحفظ التعديلات في هذا المتصفح فقط. لن تظهر للزوار حتى تنشر ملف البيانات.</p></div>
    <div className="backup-grid">
      <article className="backup-option"><span className="option-icon">⇩</span><h3>نسخة احتياطية</h3><p>نزّل نسخة كاملة من بيانات متجرك بصيغة JSON، أو استعد نسخة سابقة.</p><button className="button button-outline" onClick={exportBackup} type="button">تنزيل نسخة احتياطية</button><button className="text-button" onClick={() => importInput.current?.click()} type="button">استيراد نسخة احتياطية</button><input accept=".json,application/json" className="visually-hidden" onChange={(event) => importBackup(event.currentTarget.files[0])} ref={importInput} type="file" /></article>
      <article className="backup-option"><span className="option-icon">↗</span><h3>نشر التعديلات</h3><p>استبدل ملف البيانات في مجلد المشروع بالملف المُنزّل ثم ارفع الموقع.</p><button className="btn" onClick={exportData} type="button">تنزيل ملف data.js</button></article>
    </div>
    <p className="err form-error" role="alert">{error}</p>
    <div className="reset-row"><div><b>استعادة البيانات الأصلية</b><p className="muted">سيتم حذف التعديلات المحفوظة في هذا المتصفح.</p></div><button className="button button-danger" onClick={reset} type="button">استعادة البيانات</button></div>
    <p className="muted backup-tip">الصور المرفوعة من اللوحة تُحفظ ضمن بيانات المتصفح وقد تستهلك مساحة كبيرة. يُفضّل وضع الصور في assets/images/products واستخدام مسارها.</p>
  </section>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(() =>
    Boolean(sessionStorage.getItem(AUTH_KEY) && localStorage.getItem(ADMIN_KEY)),
  );
  const [data, setData] = useState(() => {
    if (sessionStorage.getItem(AUTH_KEY) && localStorage.getItem(ADMIN_KEY)) return window.DB.get();
    return null;
  });
  const [tab, setTab] = useState("products");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }

  function persist(nextData, message = "تم الحفظ") {
    if (window.DB.save(nextData)) {
      setData(nextData);
      if (message) notify(message);
    }
  }

  if (!authenticated) {
    return <Login onLogin={() => {
      setData(window.DB.get());
      setAuthenticated(true);
    }} />;
  }

  const activeTab = TABS.find(([id]) => id === tab);
  const sections = {
    products: <Products data={data} onChange={persist} onSave={(product) => {
      const exists = data.products.some((item) => item.id === product.id);
      persist({ ...data, products: exists
        ? data.products.map((item) => item.id === product.id ? product : item)
        : [product, ...data.products] }, "تم حفظ المنتج");
    }} />,
    cats: <Categories data={data} onChange={persist} />,
    set: <Settings data={data} onChange={persist} />,
    bak: <Backup data={data} onChange={persist} onReset={() => {
      window.DB.reset();
      setData(window.DB.get());
      notify("تمت استعادة البيانات الأصلية");
    }} />,
  };

  return <div className="admin-shell">
    <aside className="sidebar">
      <a className="brand-lockup" href="index.html"><img className="brand-icon" src="assets/images/banners/MyLogo.png" alt="" /><span><b>جنة الرحمن</b><small>إدارة المتجر</small></span></a>
      <p className="nav-caption">القائمة الرئيسية</p>
      <nav aria-label="أقسام لوحة التحكم" className="admin-nav">
        {TABS.map(([id, label, icon]) => <button aria-current={tab === id ? "page" : undefined} className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)} type="button"><span className="nav-icon">{icon}</span>{label}{tab === id && <span className="nav-arrow" aria-hidden="true">‹</span>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span>✦</span><b>احتفظ بنسخة احتياطية</b><p>صدّر بياناتك بانتظام لحمايتها.</p></div>
        <a className="store-link" href="index.html" target="_blank" rel="noreferrer"><span>↗</span> عرض المتجر</a>
        <button className="logout-link" onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }} type="button"><span>⇥</span> تسجيل الخروج</button>
      </div>
    </aside>
    <main className="dashboard">
      <header className="topbar"><div><p className="breadcrumb">لوحة التحكم <span>/</span> {activeTab[1]}</p><h1>{activeTab[1]}</h1></div><a className="mobile-store-link" href="index.html" target="_blank" rel="noreferrer">عرض المتجر ↗</a></header>
      <section aria-label="ملخص المتجر" className="stats-row">
        <article className="stat-card"><span className="stat-icon">▤</span><div><span>إجمالي المنتجات</span><b>{data.products.length}</b></div></article>
        <article className="stat-card"><span className="stat-icon">◈</span><div><span>التصنيفات</span><b>{data.categories.length}</b></div></article>
        <article className="stat-card"><span className="stat-icon">✓</span><div><span>منتجات متاحة</span><b>{data.products.filter((product) => product.available !== false).length}</b></div></article>
      </section>
      <div className="tab-content" key={tab}>{sections[tab]}</div>
      <footer className="dashboard-footer">جنة الرحمن <span>·</span> لوحة إدارة المتجر</footer>
    </main>
    {toast && <div className="toast-message" role="status">{toast}</div>}
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
