import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/* ============================================================
   سودان قاليري — Sudan Gallery · sudangallery.com · v2
   + صفحة مصمم عامة (#d=id) + روابط أعمال (#work=id) + معرض صور كامل
   ============================================================ */

const C = {
  canvas: "#FBFBFD",
  section: "#F5F5F7",
  ink: "#1D1D1F",
  gray: "#6E6E73",
  line: "#E8E8ED",
  blue: "#0071E3",
  green: "#25D366",
};

interface ProfileRow {
  id: string;
  full_name: string | null;
  specialty: string | null;
  location: string | null;
  whatsapp_number: string | null;
  bio: string | null;
}

interface ImageRow { image_url: string; position: number }

interface ProjectRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  profiles?: { full_name: string | null; location: string | null; whatsapp_number: string | null; specialty: string | null } | null;
  project_images?: ImageRow[] | null;
}

interface JobRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  budget: string | null;
  location: string | null;
  profiles?: { full_name: string | null; whatsapp_number: string | null } | null;
}

const CATS = ["الكل", "هوية بصرية", "UI/UX", "بوسترات", "تغليف", "رسم رقمي", "تصوير", "موشن"];

const SITE = "https://sudangallery.com";

const waLink = (num: string, title: string) =>
  `https://wa.me/${num}?text=${encodeURIComponent(`السلام عليكم، شفت إعلانك في سودان قاليري عن: ${title}`)}`;

const seedOf = (s: string) => {
  let n = 0;
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i);
  return n;
};

const Cover = ({ url, seed = 1, height = 210 }: { url?: string | null; seed?: number; height?: number }) => {
  if (url) return <img src={url} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />;
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

export default function App() {
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null);
  const [designer, setDesigner] = useState<ProfileRow | null>(null);
  const [designerProjects, setDesignerProjects] = useState<ProjectRow[]>([]);
  const [cat, setCat] = useState("الكل");
  const [postTab, setPostTab] = useState("work");
  const [authTab, setAuthTab] = useState("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");

  const [wTitle, setWTitle] = useState("");
  const [wCat, setWCat] = useState(CATS[1]);
  const [wDesc, setWDesc] = useState("");
  const [wFiles, setWFiles] = useState<FileList | null>(null);

  const [jTitle, setJTitle] = useState("");
  const [jCat, setJCat] = useState(CATS[1]);
  const [jBudget, setJBudget] = useState("");
  const [jLoc, setJLoc] = useState("");
  const [jDesc, setJDesc] = useState("");
  const [jWa, setJWa] = useState("");

  const [me, setMe] = useState<ProfileRow | null>(null);
  const [myProjects, setMyProjects] = useState<ProjectRow[]>([]);

  const go = (s: string) => {
    setMsg("");
    setScreen(s);
    if (s !== "project" && s !== "designer") history.replaceState(null, "", location.pathname);
    window.scrollTo(0, 0);
  };

  const copyText = async (t: string, done: string) => {
    try { await navigator.clipboard.writeText(t); setMsg(done); }
    catch { setMsg(t); }
  };

  const openProject = async (idOrRow: string | ProjectRow) => {
    const id = typeof idOrRow === "string" ? idOrRow : idOrRow.id;
    if (typeof idOrRow !== "string") setActiveProject(idOrRow);
    setScreen("project");
    setMsg("");
    history.replaceState(null, "", `#work=${id}`);
    window.scrollTo(0, 0);
    const { data } = await supabase
      .from("projects")
      .select("*, profiles(full_name, location, whatsapp_number, specialty), project_images(image_url, position)")
      .eq("id", id)
      .single();
    if (data) setActiveProject(data as ProjectRow);
  };

  const openDesigner = async (id: string) => {
    setScreen("designer");
    setMsg("");
    setDesigner(null);
    history.replaceState(null, "", `#d=${id}`);
    window.scrollTo(0, 0);
    const p = await supabase.from("profiles").select("*").eq("id", id).single();
    setDesigner((p.data as ProfileRow) ?? null);
    const w = await supabase
      .from("projects").select("*")
      .eq("owner_id", id).eq("status", "published")
      .order("created_at", { ascending: false });
    setDesignerProjects((w.data as ProjectRow[]) ?? []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    const p = await supabase
      .from("projects")
      .select("*, profiles(full_name, location, whatsapp_number, specialty)")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    setProjects((p.data as ProjectRow[]) ?? []);
    const j = await supabase
      .from("jobs")
      .select("*, profiles(full_name, whatsapp_number)")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    setJobs((j.data as JobRow[]) ?? []);
  };

  useEffect(() => {
    loadData();
    const h = location.hash;
    if (h.startsWith("#work=")) openProject(h.slice(6));
    else if (h.startsWith("#d=")) openDesigner(h.slice(3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) { setMe(null); setMyProjects([]); return; }
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => setMe((data as ProfileRow) ?? null));
    supabase.from("projects").select("*").eq("owner_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setMyProjects((data as ProjectRow[]) ?? []));
  }, [user, screen]);

  const doSignup = async () => {
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPass,
      options: { data: { full_name: authName.trim() } },
    });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg("تم! افتح إيميلك واضغط رابط التأكيد، وبعدها ارجع سجّل دخول.");
    setAuthTab("login");
  };

  const doLogin = async () => {
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPass });
    setBusy(false);
    if (error) { setMsg("البيانات غير صحيحة أو الحساب غير مؤكد."); return; }
    go("profile");
  };

  const doGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setMsg("دخول Google غير متاح حالياً — استخدم الإيميل.");
  };

  const doLogout = async () => { await supabase.auth.signOut(); go("home"); };

  const publishWork = async () => {
    if (!user) { go("auth"); return; }
    if (!wTitle.trim()) { setMsg("اكتب عنوان للعمل."); return; }
    setBusy(true); setMsg("");
    try {
      let cover: string | null = null;
      const urls: string[] = [];
      if (wFiles && wFiles.length > 0) {
        for (let i = 0; i < Math.min(wFiles.length, 6); i++) {
          const f = wFiles[i];
          const ext = f.name.split(".").pop() || "jpg";
          const path = `${user.id}/${Date.now()}-${i}.${ext}`;
          const up = await supabase.storage.from("projects").upload(path, f);
          if (up.error) throw up.error;
          const pub = supabase.storage.from("projects").getPublicUrl(path);
          urls.push(pub.data.publicUrl);
        }
        cover = urls[0] ?? null;
      }
      const ins = await supabase.from("projects")
        .insert({ owner_id: user.id, title: wTitle.trim(), description: wDesc.trim(), category: wCat, cover_image_url: cover })
        .select().single();
      if (ins.error) throw ins.error;
      if (urls.length > 1) {
        await supabase.from("project_images").insert(
          urls.slice(1).map((u, i) => ({ project_id: (ins.data as ProjectRow).id, image_url: u, position: i }))
        );
      }
      setWTitle(""); setWDesc(""); setWFiles(null);
      await loadData();
      go("home");
    } catch {
      setMsg("حصلت مشكلة في النشر — جرّب تاني أو بصور أقل حجماً.");
    }
    setBusy(false);
  };

  const publishJob = async () => {
    if (!user) { go("auth"); return; }
    if (!jTitle.trim() || !jWa.trim()) { setMsg("اكتب العنوان ورقم الواتساب."); return; }
    setBusy(true); setMsg("");
    try {
      await supabase.from("profiles").update({ whatsapp_number: jWa.replace(/\D/g, "") }).eq("id", user.id);
      const ins = await supabase.from("jobs").insert({
        owner_id: user.id, title: jTitle.trim(), description: jDesc.trim(),
        category: jCat, budget: jBudget.trim() || "بالاتفاق", location: jLoc.trim() || "السودان",
      });
      if (ins.error) throw ins.error;
      setJTitle(""); setJDesc(""); setJBudget(""); setJLoc(""); setJWa("");
      await loadData();
      go("jobs");
    } catch {
      setMsg("حصلت مشكلة في النشر — جرّب تاني.");
    }
    setBusy(false);
  };

  const saveProfile = async () => {
    if (!user || !me) return;
    setBusy(true);
    await supabase.from("profiles").update({
      full_name: me.full_name, specialty: me.specialty, location: me.location,
      whatsapp_number: me.whatsapp_number ? me.whatsapp_number.replace(/\D/g, "") : null, bio: me.bio,
    }).eq("id", user.id);
    setBusy(false);
    setMsg("تم حفظ ملفك.");
  };

  const filtered = cat === "الكل" ? projects : projects.filter((p) => p.category === cat);

  const gallery: string[] = activeProject
    ? [
        ...(activeProject.cover_image_url ? [activeProject.cover_image_url] : []),
        ...((activeProject.project_images ?? [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((im) => im.image_url)),
      ]
    : [];

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
        .btn:disabled { opacity: .5; cursor: default; }
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
        .notice { background: #F5F5F7; border-radius: 12px; padding: 12px 16px; font-size: 14px; margin-top: 16px; word-break: break-all; }
        .navlinks { display: flex; gap: 18px; font-size: 14px; font-weight: 700; }
        @media (prefers-reduced-motion: reduce) { .card, .btn { transition: none; } .card:hover { transform: none; } }
        @media (max-width: 640px) { .hero-h { font-size: 38px !important; } .brand-en { display: none; } .navlinks { gap: 12px; } }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(251,251,253,.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 14, height: 56 }}>
          <a onClick={() => go("home")} style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 19 }}>سودان قاليري</span>
            <span className="brand-en" style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: ".4px" }} dir="ltr">SUDAN GALLERY</span>
          </a>
          <nav className="navlinks">
            <a onClick={() => go("home")} style={{ color: screen === "home" ? C.ink : C.gray }}>الأعمال</a>
            <a onClick={() => go("jobs")} style={{ color: screen === "jobs" ? C.ink : C.gray }}>فرص</a>
          </nav>
          <div style={{ marginInlineStart: "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {user ? (
              <a className="link" style={{ fontSize: 14 }} onClick={() => go("profile")}>حسابي</a>
            ) : (
              <a className="link" style={{ fontSize: 14 }} onClick={() => go("auth")}>دخول</a>
            )}
            <button className="btn btn-blue" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => go("post")}>انشر</button>
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
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p className="sub" style={{ fontSize: 17, marginBottom: 18 }}>لسة ما في أعمال منشورة هنا.</p>
                <button className="btn btn-blue" onClick={() => go("post")}>كن أول من ينشر</button>
              </div>
            ) : (
              <div className="grid">
                {filtered.map((p) => (
                  <a key={p.id} className="card" onClick={() => openProject(p)}>
                    <Cover url={p.cover_image_url} seed={seedOf(p.id)} />
                    <div style={{ padding: 18 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 5 }}>{p.category}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{p.title}</div>
                      <div className="sub" style={{ fontSize: 13 }}>{p.profiles?.full_name ?? "مصمم"}{p.profiles?.location ? ` · ${p.profiles.location}` : ""}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {screen === "project" && activeProject && (
        <section className="wrap" style={{ padding: "36px 22px 80px", maxWidth: 840 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <a className="link" onClick={() => go("home")}>‹ الأعمال</a>
            <button className="btn btn-quiet" style={{ padding: "8px 16px", fontSize: 13 }}
                    onClick={() => copyText(`${SITE}/#work=${activeProject.id}`, "تم نسخ رابط العمل — شاركو وين ما تحب.")}>
              مشاركة العمل ↗
            </button>
          </div>
          <h1 style={{ fontSize: 38, margin: "16px 0 4px" }}>{activeProject.title}</h1>
          <div className="sub" style={{ fontSize: 15, marginBottom: 26 }}>{activeProject.category}</div>

          {gallery.length === 0 ? (
            <div style={{ borderRadius: 20, overflow: "hidden" }}>
              <Cover seed={seedOf(activeProject.id)} height={340} />
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {gallery.map((u, i) => (
                <div key={i} style={{ borderRadius: 20, overflow: "hidden" }}>
                  <img src={u} alt="" style={{ width: "100%", display: "block" }} />
                </div>
              ))}
            </div>
          )}

          {activeProject.description && (
            <p style={{ fontSize: 17, lineHeight: 1.9, margin: "26px 0 10px", maxWidth: 640 }}>{activeProject.description}</p>
          )}

          <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
            <a onClick={() => openDesigner(activeProject.owner_id)} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", background: C.section, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20 }}>
                {(activeProject.profiles?.full_name ?? "م")[0]}
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 800, fontSize: 18 }}>{activeProject.profiles?.full_name ?? "مصمم"}</span>
                <span className="sub" style={{ display: "block", fontSize: 13 }}>شوف كل أعمالو ‹</span>
              </span>
            </a>
            {activeProject.profiles?.whatsapp_number && (
              <a className="btn" style={{ background: C.green, color: "#fff" }}
                 href={waLink(activeProject.profiles.whatsapp_number, activeProject.title)} target="_blank" rel="noreferrer">
                تواصل واتساب
              </a>
            )}
          </div>
          {msg && <div className="notice">{msg}</div>}
        </section>
      )}

      {screen === "designer" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 880 }}>
          {!designer ? (
            <p className="sub" style={{ textAlign: "center", padding: "50px 0" }}>...</p>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <span style={{ width: 88, height: 88, borderRadius: "50%", background: C.section, display: "inline-grid", placeItems: "center", fontWeight: 800, fontSize: 34 }}>
                  {(designer.full_name ?? "م")[0]}
                </span>
                <h1 style={{ fontSize: 32, margin: "14px 0 4px" }}>{designer.full_name ?? "مصمم"}</h1>
                <div className="sub" style={{ fontSize: 15 }}>
                  {designer.specialty ?? ""}{designer.location ? ` · ${designer.location}` : ""}
                </div>
                {designer.bio && (
                  <p className="sub" style={{ fontSize: 15, maxWidth: 440, margin: "10px auto 0", lineHeight: 1.7 }}>{designer.bio}</p>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
                  {designer.whatsapp_number && (
                    <a className="btn" style={{ background: C.green, color: "#fff" }}
                       href={waLink(designer.whatsapp_number, "ملفك في سودان قاليري")} target="_blank" rel="noreferrer">
                      تواصل واتساب
                    </a>
                  )}
                  <button className="btn btn-quiet"
                          onClick={() => copyText(`${SITE}/#d=${designer.id}`, "تم نسخ رابط الملف — شاركو وين ما تحب.")}>
                    مشاركة الملف ↗
                  </button>
                </div>
                {msg && <div className="notice" style={{ maxWidth: 440, margin: "16px auto 0" }}>{msg}</div>}
              </div>
              {designerProjects.length === 0 ? (
                <p className="sub" style={{ textAlign: "center" }}>ما في أعمال منشورة بعد.</p>
              ) : (
                <div className="grid">
                  {designerProjects.map((p) => (
                    <a key={p.id} className="card" onClick={() => openProject(p)}>
                      <Cover url={p.cover_image_url} seed={seedOf(p.id)} height={180} />
                      <div style={{ padding: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>{p.title}</div>
                        <div className="sub" style={{ fontSize: 13 }}>{p.category}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {screen === "jobs" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 720 }}>
          <h1 style={{ fontSize: 36 }}>فرص شغل</h1>
          <p className="sub" style={{ fontSize: 16, margin: "8px 0 30px" }}>التواصل مباشرة عبر واتساب.</p>
          {jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <p className="sub" style={{ fontSize: 17, marginBottom: 18 }}>ما في فرص منشورة حالياً.</p>
              <button className="btn btn-blue" onClick={() => { setPostTab("job"); go("post"); }}>انشر فرصة</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {jobs.map((j) => (
                <div key={j.id} className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 5 }}>{j.category}{j.location ? ` · ${j.location}` : ""}</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{j.title}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: C.blue, fontSize: 15 }}>{j.budget}</div>
                  </div>
                  {j.description && <p className="sub" style={{ fontSize: 15, lineHeight: 1.8, margin: "12px 0 16px" }}>{j.description}</p>}
                  {j.profiles?.whatsapp_number && (
                    <a className="btn" style={{ background: C.green, color: "#fff", display: "inline-block", padding: "9px 20px", fontSize: 14 }}
                       href={waLink(j.profiles.whatsapp_number, j.title)} target="_blank" rel="noreferrer">تقديم عبر واتساب</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {screen === "post" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 560 }}>
          <h1 style={{ fontSize: 34 }}>انشر</h1>
          {!user && <div className="notice">لازم تسجّل دخول الأول — <a className="link" onClick={() => go("auth")}>من هنا</a></div>}
          <div style={{ display: "flex", gap: 8, margin: "22px 0" }}>
            <button className={`chip ${postTab === "work" ? "on" : ""}`} onClick={() => setPostTab("work")}>عمل تصميم</button>
            <button className={`chip ${postTab === "job" ? "on" : ""}`} onClick={() => setPostTab("job")}>فرصة شغل</button>
          </div>
          <div className="card" style={{ padding: 26 }}>
            {postTab === "work" ? (
              <>
                <label>عنوان العمل</label>
                <input value={wTitle} onChange={(e) => setWTitle(e.target.value)} placeholder="مثلاً: هوية مقهى جبنة" />
                <label>التصنيف</label>
                <select value={wCat} onChange={(e) => setWCat(e.target.value)}>
                  {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
                <label>الوصف</label>
                <textarea rows={4} value={wDesc} onChange={(e) => setWDesc(e.target.value)} placeholder="احكي عن الشغلانة — الفكرة، العميل، الأدوات..." />
                <label>الصور (الأولى هي الغلاف)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setWFiles(e.target.files)} />
                <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }} disabled={busy} onClick={publishWork}>
                  {busy ? "جاري النشر..." : "نشر العمل"}
                </button>
              </>
            ) : (
              <>
                <label>عنوان الفرصة</label>
                <input value={jTitle} onChange={(e) => setJTitle(e.target.value)} placeholder="مثلاً: مصمم هوية لمطعم جديد" />
                <label>التصنيف</label>
                <select value={jCat} onChange={(e) => setJCat(e.target.value)}>
                  {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
                <label>الميزانية</label>
                <input value={jBudget} onChange={(e) => setJBudget(e.target.value)} placeholder="٥٠٠ ألف جنيه / بالاتفاق" />
                <label>المكان</label>
                <input value={jLoc} onChange={(e) => setJLoc(e.target.value)} placeholder="الخرطوم / عن بُعد" />
                <label>التفاصيل</label>
                <textarea rows={4} value={jDesc} onChange={(e) => setJDesc(e.target.value)} placeholder="شنو المطلوب؟ والتسليم متين؟" />
                <label>رقم واتساب للتواصل</label>
                <input dir="ltr" value={jWa} onChange={(e) => setJWa(e.target.value)} placeholder="249XXXXXXXXX" />
                <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }} disabled={busy} onClick={publishJob}>
                  {busy ? "جاري النشر..." : "نشر الفرصة"}
                </button>
              </>
            )}
            {msg && <div className="notice">{msg}</div>}
          </div>
        </section>
      )}

      {screen === "profile" && (
        <section className="wrap" style={{ padding: "48px 22px 80px", maxWidth: 880 }}>
          {!user ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p className="sub" style={{ fontSize: 17, marginBottom: 18 }}>سجّل دخول عشان تشوف ملفك.</p>
              <button className="btn btn-blue" onClick={() => go("auth")}>دخول</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <h1 style={{ fontSize: 30 }}>ملفي</h1>
                <a className="link" style={{ fontSize: 14 }} onClick={doLogout}>تسجيل خروج</a>
              </div>

              <div className="card" style={{ padding: 20, margin: "18px 0", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14, flex: 1, minWidth: 180 }}>رابط ملفك العام — شاركو في البايو والواتساب:</span>
                <button className="btn btn-quiet" style={{ padding: "8px 16px", fontSize: 13 }}
                        onClick={() => copyText(`${SITE}/#d=${user.id}`, "تم نسخ رابط ملفك ✓")}>
                  نسخ الرابط
                </button>
                <button className="btn btn-quiet" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => openDesigner(user.id)}>
                  معاينة
                </button>
              </div>

              <div className="card" style={{ padding: 26, margin: "0 0 40px" }}>
                <label>الاسم</label>
                <input value={me?.full_name ?? ""} onChange={(e) => setMe(me ? { ...me, full_name: e.target.value } : me)} />
                <label>التخصص</label>
                <input value={me?.specialty ?? ""} onChange={(e) => setMe(me ? { ...me, specialty: e.target.value } : me)} placeholder="هوية بصرية / UI/UX / ..." />
                <label>المدينة</label>
                <input value={me?.location ?? ""} onChange={(e) => setMe(me ? { ...me, location: e.target.value } : me)} placeholder="الخرطوم" />
                <label>رقم واتساب (بيظهر للناس عشان يتواصلوا معاك)</label>
                <input dir="ltr" value={me?.whatsapp_number ?? ""} onChange={(e) => setMe(me ? { ...me, whatsapp_number: e.target.value } : me)} placeholder="249XXXXXXXXX" />
                <label>نبذة</label>
                <textarea rows={3} value={me?.bio ?? ""} onChange={(e) => setMe(me ? { ...me, bio: e.target.value } : me)} />
                <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }} disabled={busy} onClick={saveProfile}>
                  {busy ? "..." : "حفظ الملف"}
                </button>
                {msg && <div className="notice">{msg}</div>}
              </div>
              <h2 style={{ fontSize: 24, marginBottom: 16 }}>أعمالي</h2>
              {myProjects.length === 0 ? (
                <p className="sub">ما نشرت أعمال لسة — <a className="link" onClick={() => { setPostTab("work"); go("post"); }}>انشر أول عمل</a></p>
              ) : (
                <div className="grid">
                  {myProjects.map((p) => (
                    <a key={p.id} className="card" onClick={() => openProject(p)}>
                      <Cover url={p.cover_image_url} seed={seedOf(p.id)} height={180} />
                      <div style={{ padding: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>{p.title}</div>
                        <div className="sub" style={{ fontSize: 13 }}>{p.category}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {screen === "auth" && (
        <section style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 22px" }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 30 }}>
            <h1 style={{ fontSize: 26, textAlign: "center" }}>{authTab === "login" ? "أهلاً تاني" : "حساب جديد"}</h1>
            <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
              <button className={`chip ${authTab === "login" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => { setAuthTab("login"); setMsg(""); }}>دخول</button>
              <button className={`chip ${authTab === "signup" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => { setAuthTab("signup"); setMsg(""); }}>تسجيل</button>
            </div>
            {authTab === "signup" && (
              <>
                <label>الاسم</label>
                <input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="اسمك الكامل" />
              </>
            )}
            <label>البريد الإلكتروني</label>
            <input dir="ltr" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@email.com" />
            <label>كلمة السر</label>
            <input dir="ltr" type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="••••••••" />
            <button className="btn btn-blue" style={{ width: "100%", marginTop: 24 }} disabled={busy}
                    onClick={authTab === "login" ? doLogin : doSignup}>
              {busy ? "..." : authTab === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
            <div className="sub" style={{ textAlign: "center", fontSize: 13, margin: "14px 0" }}>أو</div>
            <button className="btn btn-quiet" style={{ width: "100%" }} onClick={doGoogle}>المتابعة بحساب Google</button>
            {msg && <div className="notice">{msg}</div>}
          </div>
        </section>
      )}

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "26px 22px", textAlign: "center" }}>
        <span className="sub" style={{ fontSize: 13 }}>سودان قاليري · Sudan Gallery · sudangallery.com · اتصمم في السودان</span>
      </footer>
    </div>
  );
}
