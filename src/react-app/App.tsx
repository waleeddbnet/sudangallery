import { useState } from "react";

/* ============================================================
   سودان قاليري — Sudan Gallery · sudangallery.com
   Apple HIG · light · sharp · quiet · RTL
   ============================================================ */

const C = {
  canvas: "#FBFBFD",
  section: "#F5F5F7",
  ink: "#1D1D1F",
  gray: "#6E6E73",
  line: "#E8E8ED",
  blue: "#0071E3",
  green: "#25D366",
  white: "#FFFFFF",
};

const Cover = ({ seed = 1, height = 210 }: { seed?: number; height?: number }) => {
  const g = [
    ["#DCE9FF", "#F3E8FF"],
    ["#FFE9D6", "#FFF6E5"],
    ["#DFF7F0", "#E8F0FF"],
    ["#FDE2E4", "#FFF0F3"],
    ["#E8F5D8", "#F3FAEA"],
    ["#EDE4FF", "#FDE8F4"],
  ][seed % 6];
  return (
    <div style={{ height, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, display: "grid", placeItems: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,.65)" }} />
    </div>
  );
};

const DESIGNERS = [
  { id: 1, name: "آلاء عثمان", specialty: "هوية بصرية", city: "الخرطوم", wa: "249912000001" },
  { id: 2, name: "محمد الفاتح", specialty: "UI/UX", city: "أم درمان", wa: "249912000002" },
  { id: 3, name: "رؤى بابكر", specialty: "رسم رقمي", city: "بورتسودان", wa: "249912000003" },
];

const PROJECTS = [
  { id: 1, title: "هوية مقهى جبنة", cat: "هوية بصرية", designer: DESIGNERS[0], seed: 0, desc: "هوية كاملة لمقهى سوداني — الشعار مستوحى من الجبنة والدلّة. شملت الشغلانة الشعار، الأكواب، واللافتات." },
  { id: 2, title: "تطبيق مواصلات الخرطوم", cat: "UI/UX", designer: DESIGNERS[1], seed: 1, desc: "تجربة مستخدم كاملة لتطبيق حجز مواصلات، بواجهة عربية أول وخط واضح للقراءة في الشمس." },
  { id: 3, title: "بوستر مهرجان النيلين", cat: "بوسترات", designer: DESIGNERS[2], seed: 2, desc: "سلسلة بوسترات للمهرجان الثقافي بتايبوغرافي عربي معاصر." },
  { id: 4, title: "تغليف عطور سنّة", cat: "تغليف", designer: DESIGNERS[0], seed: 3, desc: "علب عطور مستوحاة من الدخان والضريرة، بلمسة هادية وأنيقة." },
  { id: 5, title: "موقع طيبة للعقارات", cat: "UI/UX", designer: DESIGNERS[1], seed: 4, desc: "واجهة بحث عقاري عربية بسيطة وسريعة على الموبايل." },
  { id: 6, title: "شخصيات سودانية", cat: "رسم رقمي", designer: DESIGNERS[2], seed: 5, desc: "شخصيات للأطفال بملامح ولبس سوداني — التوب، الجلابية، العمامة." },
];

const JOBS = [
  { id: 1, title: "مصمم هوية لمطعم جديد", cat: "هوية بصرية", budget: "٥٠٠ ألف جنيه", loc: "الخرطوم", wa: "249912000010", desc: "مطعم أكلات سودانية بفتح قريباً. مطلوب شعار وهوية كاملة: منيو، لافتة، سوشيال ميديا." },
  { id: 2, title: "واجهة تطبيق دفع", cat: "UI/UX", budget: "بالاتفاق", loc: "عن بُعد", wa: "249912000011", desc: "شركة فنتك محتاجة مصمم لتطبيق محفظة. خبرة RTL شرط أساسي." },
  { id: 3, title: "بوسترات حملة توعية", cat: "بوسترات", budget: "٢٠٠ ألف جنيه", loc: "أم درمان", wa: "249912000012", desc: "٥ بوسترات لحملة صحية. التسليم خلال أسبوعين." },
];

const CATS = ["الكل", "هوية بصرية", "UI/UX", "بوسترات", "تغليف", "رسم رقمي"];

type Project = (typeof PROJECTS)[number];

const waLink = (num: string, title: string) =>
  `https://wa.me/${num}?text=${encodeURIComponent(`السلام عليكم، شفت إعلانك في سودان قاليري عن: ${title}`)}`;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [cat, setCat] = useState("الكل");
  const [postTab, setPostTab] = useState("work");
  const [authTab, setAuthTab] = useState("login");

  const openProject = (p: Project) => { setActiveProject(p); setScreen("project"); window.scrollTo(0, 0); };
  const go = (s: string) => { setScreen(s); window.scrollTo(0, 0); };
  const filtered = cat === "الكل" ? PROJECTS : PROJECTS.filter((p) => p.cat === cat);

  return (
    <div dir="rtl" style={{ background: C.canvas, minHeight: "100vh", color: C.ink, fontFamily: "'Almarai','SF Arabic','Segoe UI',Tahoma,sans-serif", textAlign: "right" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; }
        html, body, #root { margin: 0; padding: 0; }
        button, a, input, textarea, select { font-family: inherit; }
        a { text-decoration: none; color: inherit; cursor: pointer; }
        button { cursor: pointer; }
        h1, h2 { font-weight: 800; letter-spacing: -0.5px; }
        .btn { border: none; border-radius: 980px; padding: 11px 24px; font-size: 15px; font-weight: 700; transition: opacity .15s ease; }
        .btn:hover { opacity: .85; }
        .btn:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid #0071E3; outline-offset: 2px; }
        .btn-blue { background: #0071E3; color: #fff; }
        .btn-quiet { background: #F5F5F7; color: #1D1D1F; }
        .link { color: #0071E3; font-weight: 700; font-size: 15px; }
        .card { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.05); transition: box-shadow .2s ease, transform .2s ease; }
        .card:hover { box-shadow: 0 10px 30px rgba(0,0,0,.10); transform: translateY(-2px); }
        .chip { border: none; background: #F5F5F7; color: #1D1D1F; border-radius: 980px; padding: 8px 18px; font-size: 14px; font-weight: 700; }
        .chip.on { background: #1D1D1F; color: #fff; }
        input, textarea, select { width: 100%; border: 1px solid #E8E8ED; border-radius: 12px; padding: 13px 15px; font-size: 15px; background: #fff; color: #1D1D1F; }
        input::placeholder, textarea::placeholder { color: #A1A1A6; }
        label { display: block; font-weight: 700; font-size: 14px; margin: 18px 0 7px; }
        .wrap { max-width: 1040px; margin: 0 auto; padding: 0 22px; }
        .grid { display: grid; gap: 22px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        .sub { color: #6E6E73; }
        @media (prefers-reduced-motion: reduce) { .card, .btn { transition: none; } .card:hover { transform: none; } }
        @media (max-width: 640px) { .hero-h { font-size: 38px !important; } }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(251,251,253,.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 22, height: 56 }}>
          <a onClick={() => go("home")} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 19 }}>سودان قاليري</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: ".4px" }} dir="ltr">SUDAN GALLERY</span>
          </a>
          <nav style={{ display: "flex", gap: 18, fontSize: 14, fontWeight: 700 }}>
            <a onClick={() => go("home")} style={{ color: screen === "home" ? C.ink : C.gray }}>الأعمال</a>
            <a onClick={() => go("jobs")} style={{ color: screen === "jobs" ? C.ink : C.gray }}>فرص شغل</a>
          </nav>
          <div style={{ marginInlineStart: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <a className="link" style={{ fontSize: 14 }} onClick={() => go("auth")}>دخول</a>
            <button className="btn btn-blue" style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => go("post")}>انشر شغلك</button>
          </div>
        </div>
      </header>

      {screen === "home" && (
        <>
          <section style={{ textAlign: "center", padding: "84px 22px 64px" }}>
            <h1 className="hero-h" style={{ fontSize: 56, lineHeight: 1.15, maxWidth: 700, margin: "0 auto" }}>
              معرض السودان.<br />
              <span style={{ color: C.gray }}>مفتوح للعالم.</span>
            </h1>
            <p className="sub" style={{ fontSize: 19, maxWidth: 520, margin: "20px auto 32px", lineHeight: 1.7 }}>
              اعرض إبداعك، شوف شغل الناس، ولقّط فرص. ببساطة.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-blue" onClick={() => go("post")}>انشر شغلك</button>
              <button className="btn btn-quiet" onClick={() => go("jobs")}>شوف الفرص</button>
            </div>
          </section>

          <section className="wrap" style={{ paddingBottom: 80 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26, justifyContent: "center" }}>
              {CATS.map((c) => (
                <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            <div className="grid">
              {filtered.map((p) => (
                <a key={p.id} className="card" onClick={() => openProject(p)}>
                  <Cover seed={p.seed} />
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 5 }}>{p.cat}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{p.title}</div>
                    <div className="sub" style={{ fontSize: 13 }}>{p.designer.name} · {p.designer.city}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      {screen === "project" && activeProject && (
        <section className="wrap" style={{ padding: "36px 22px 80px", maxWidth: 840 }}>
          <a className="link" onClick={() => go("home")}>‹ الأعمال</a>
          <h1 style={{ fontSize: 38, margin: "16px 0 4px" }}>{activeProject.title}</h1>
          <div className="sub" style={{ fontSize: 15, marginBottom: 26 }}>{activeProject.cat}</div>

          <div style={{ borderRadius: 20, overflow: "hidden" }}><Cover seed={activeProject.seed} height={340} /></div>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", margin: "16px 0 30px" }}>
            <div style={{ borderRadius: 16, overflow: "hidden" }}><Cover seed={activeProject.seed + 2} height={170} /></div>
            <div style={{ borderRadius: 16, overflow: "hidden" }}><Cover seed={activeProject.seed + 4} height={170} /></div>
          </div>

          <p style={{ fontSize: 17, lineHeight: 1.9, marginBottom: 36, maxWidth: 640 }}>{activeProject.desc}</p>

          <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ width: 52, height: 52, borderRadius: "50%", background: C.section, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20 }}>{activeProject.designer.name[0]}</span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{activeProject.designer.name}</div>
              <div className="sub" style={{ fontSize: 14 }}>{activeProject.designer.specialty} · {activeProject.designer.city}</div>
            </div>
            <a className="btn" style={{ background: C.green, color: "#fff" }} href={waLink(activeProject.designer.wa, activeProject.title)} target="_blank" rel="noreferrer">
              تواصل واتساب
            </a>
          </div>
        </section>
      )}

      {screen === "jobs" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 720 }}>
          <h1 style={{ fontSize: 36 }}>فرص شغل</h1>
          <p className="sub" style={{ fontSize: 16, margin: "8px 0 30px" }}>التواصل مباشرة عبر واتساب.</p>
          <div style={{ display: "grid", gap: 16 }}>
            {JOBS.map((j) => (
              <div key={j.id} className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 5 }}>{j.cat} · {j.loc}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{j.title}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: C.blue, fontSize: 15 }}>{j.budget}</div>
                </div>
                <p className="sub" style={{ fontSize: 15, lineHeight: 1.8, margin: "12px 0 16px" }}>{j.desc}</p>
                <a className="btn" style={{ background: C.green, color: "#fff", display: "inline-block", padding: "9px 20px", fontSize: 14 }}
                   href={waLink(j.wa, j.title)} target="_blank" rel="noreferrer">تقديم عبر واتساب</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "post" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 560 }}>
          <h1 style={{ fontSize: 34 }}>انشر</h1>
          <div style={{ display: "flex", gap: 8, margin: "22px 0" }}>
            <button className={`chip ${postTab === "work" ? "on" : ""}`} onClick={() => setPostTab("work")}>عمل تصميم</button>
            <button className={`chip ${postTab === "job" ? "on" : ""}`} onClick={() => setPostTab("job")}>فرصة شغل</button>
          </div>
          <div className="card" style={{ padding: 26 }}>
            {postTab === "work" ? (
              <>
                <label>عنوان العمل</label>
                <input placeholder="مثلاً: هوية مقهى جبنة" />
                <label>التصنيف</label>
                <select>{CATS.slice(1).map((c) => <option key={c}>{c}</option>)}</select>
                <label>الوصف</label>
                <textarea rows={4} placeholder="احكي عن الشغلانة — الفكرة، العميل، الأدوات..." />
                <label>الصور</label>
                <div style={{ border: "1.5px dashed #E8E8ED", borderRadius: 14, padding: 30, textAlign: "center", fontSize: 14 }} className="sub">
                  اسحب الصور هنا — الأولى هي الغلاف
                </div>
                <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }}>نشر العمل</button>
              </>
            ) : (
              <>
                <label>عنوان الفرصة</label>
                <input placeholder="مثلاً: مصمم هوية لمطعم جديد" />
                <label>التصنيف</label>
                <select>{CATS.slice(1).map((c) => <option key={c}>{c}</option>)}</select>
                <label>الميزانية</label>
                <input placeholder="٥٠٠ ألف جنيه / بالاتفاق" />
                <label>المكان</label>
                <input placeholder="الخرطوم / عن بُعد" />
                <label>التفاصيل</label>
                <textarea rows={4} placeholder="شنو المطلوب؟ والتسليم متين؟" />
                <label>رقم واتساب</label>
                <input dir="ltr" placeholder="249XXXXXXXXX" />
                <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }}>نشر الفرصة</button>
              </>
            )}
          </div>
        </section>
      )}

      {screen === "profile" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 880 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ width: 88, height: 88, borderRadius: "50%", background: C.section, display: "inline-grid", placeItems: "center", fontWeight: 800, fontSize: 34 }}>آ</span>
            <h1 style={{ fontSize: 32, margin: "14px 0 4px" }}>آلاء عثمان</h1>
            <div className="sub" style={{ fontSize: 15 }}>هوية بصرية · الخرطوم</div>
            <p className="sub" style={{ fontSize: 15, maxWidth: 440, margin: "10px auto 18px", lineHeight: 1.7 }}>
              مصممة هويات بصرية بحب أدمج التراث السوداني في شغل معاصر. فري لانس من ٢٠١٩.
            </p>
            <a className="btn" style={{ background: C.green, color: "#fff" }} href={waLink("249912000001", "ملفك في سودان قاليري")} target="_blank" rel="noreferrer">تواصل واتساب</a>
          </div>
          <div className="grid">
            {PROJECTS.filter((p) => p.designer.id === 1).map((p) => (
              <a key={p.id} className="card" onClick={() => openProject(p)}>
                <Cover seed={p.seed} height={180} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{p.title}</div>
                  <div className="sub" style={{ fontSize: 13 }}>{p.cat}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {screen === "auth" && (
        <section style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 22px" }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 30 }}>
            <h1 style={{ fontSize: 26, textAlign: "center" }}>{authTab === "login" ? "أهلاً تاني" : "حساب جديد"}</h1>
            <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
              <button className={`chip ${authTab === "login" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => setAuthTab("login")}>دخول</button>
              <button className={`chip ${authTab === "signup" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => setAuthTab("signup")}>تسجيل</button>
            </div>
            {authTab === "signup" && (<><label>الاسم</label><input placeholder="اسمك الكامل" /></>)}
            <label>البريد الإلكتروني</label>
            <input dir="ltr" type="email" placeholder="you@email.com" />
            <label>كلمة السر</label>
            <input dir="ltr" type="password" placeholder="••••••••" />
            <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }} onClick={() => go("profile")}>
              {authTab === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
            <div className="sub" style={{ textAlign: "center", fontSize: 13, margin: "14px 0" }}>أو</div>
            <button className="btn btn-quiet" style={{ width: "100%" }}>المتابعة بحساب Google</button>
          </div>
        </section>
      )}

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "26px 22px", textAlign: "center" }}>
        <span className="sub" style={{ fontSize: 13 }}>سودان قاليري · Sudan Gallery · sudangallery.com · اتصمم في السودان</span>
      </footer>
    </div>
  );
}
