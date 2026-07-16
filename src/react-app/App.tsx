import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/* ============================================================
   سودان قاليري — Sudan Gallery · sudangallery.com
   Live version — connected to Supabase
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

interface ProjectRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  profiles?: { full_name: string | null; location: string | null; whatsapp_number: string | null; specialty: string | null } | null;
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
  const [cat, setCat] = useState("الكل");
  const [postTab, setPostTab] = useState("work");
  const [authTab, setAuthTab] = useState("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // auth form
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");

  // post work form
  const [wTitle, setWTitle] = useState("");
  const [wCat, setWCat] = useState(CATS[1]);
  const [wDesc, setWDesc] = useState("");
  const [wFiles, setWFiles] = useState<FileList | null>(null);

  // post job form
  const [jTitle, setJTitle] = useState("");
  const [jCat, setJCat] = useState(CATS[1]);
  const [jBudget, setJBudget] = useState("");
  const [jLoc, setJLoc] = useState("");
  const [jDesc, setJDesc] = useState("");
  const [jWa, setJWa] = useState("");

  // profile
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [myProjects, setMyProjects] = useState<ProjectRow[]>([]);

  const go = (s: string) => { setMsg(""); setScreen(s); window.scrollTo(0, 0); };
  const openProject = (p: ProjectRow) => { setActiveProject(p); go("project"); };

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

  useEffect(() => { loadData(); }, []);

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
    if (error) setMsg("دخول Google غير مفعّل حالياً — استخدم الإيميل.");
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
        .notice { background: #F5F5F7; border-radius: 12px; padding: 12px 16px; font-size: 14px; margin-top: 16px; }
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
          <a className="link" onClick={() => go("home")}>‹ الأعمال</a>
          <h1 style={{ fontSize: 38, margin: "16px 0 4px" }}>{activeProject.title}</h1>
          <div className="sub" style={{ fontSize: 15, marginBottom: 26 }}>{activeProject.category}</div>
          <div style={{ borderRadius: 20, overflow: "hidden" }}>
            <Cover url={activeProject.cover_image_url} seed={seedOf(activeProject.id)} height={340} />
          </div>
          {activeProject.description && (
            <p style={{ fontSize: 17, lineHeight: 1.9, margin: "26px 0 36px", maxWidth: 640 }}>{activeProject.description}</p>
          )}
          <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
            <span style={{ width: 52, height: 52, borderRadius: "50%", background: C.section, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20 }}>
              {(activeProject.profiles?.full_name ?? "م")[0]}
            </span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{activeProject.profiles?.full_name ?? "مصمم"}</div>
              <div className="sub" style={{ fontSize: 14 }}>
                {activeProject.profiles?.specialty ?? ""}{activeProject.profiles?.location ? ` · ${activeProject.profiles.location}` : ""}
              </div>
            </div>
            {activeProject.profiles?.whatsapp_number && (
              <a className="btn" style={{ background: C.green, color: "#fff" }}
                 href={waLink(activeProject.profiles.whatsapp_number, activeProject.title)} target="_blank" rel="noreferrer">
                تواصل واتساب
              </a>
            )}
          </div>
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
      
