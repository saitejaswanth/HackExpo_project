import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API || "http://localhost:8080/api";
const call = async (path, method = "GET", body) => {
  const r = await fetch(API + path, {
    method, headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(r.status === 401 ? "Invalid credentials" : "Server error");
  return r.json();
};
const avg = (s) => Math.round((s.math + s.programming + s.dbms) / 3);
const ACCENTS = ["#7c3aed", "#059669", "#f97316", "#2563eb"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [students, setStudents] = useState([]);
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState("");
  const [day, setDay] = useState("Tue");
  const [tt, setTt] = useState([]);
  const [q, setQ] = useState("");

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const load = () => call("/students").then(setStudents).catch(() => say("Backend not reachable"));
  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => { if (user) call("/timetable?day=" + day).then(setTt); }, [user, day]);

  const staff = user && user.role !== "STUDENT";
  const me = students.find((s) => s.rollNo === (sel || user?.username)) || students[0];
  const save = async (roll, patch, msg) => {
    const u = await call("/students/" + roll, "PUT", patch);
    setStudents((l) => l.map((s) => (s.rollNo === roll ? u : s)));
    say(msg);
  };

  if (!user) return <Login onLogin={setUser} />;

  const pages = staff
    ? ["Dashboard", "Students", "Student Profile", "Marks Form", "Timetable", "Fees"]
    : ["Student Profile", "Timetable", "Fees"];
  if (!staff && page === "Dashboard") setPage("Student Profile");
  const go = (p) => { setPage(p); setMenu(false); };
  const below = students.filter((s) => s.attendance < 75);
  const pending = students.reduce((a, s) => a + s.feeTotal - s.feePaid, 0);

  return (
    <>
      <header className="grad">
        <button className="ib" onClick={() => setMenu(!menu)}>☰</button>
        <div className="logo">C</div>
        <div>CampusHub<small>{staff ? "Faculty & Management Portal" : "Student Portal"}</small></div>
        <div className="sp" />
        <button className="ib" onClick={() => document.body.classList.toggle("dark")}>🌙</button>
      </header>

      <nav className={menu ? "open" : ""}>
        {pages.map((p) => (
          <button key={p} className={"m" + (page === p ? " on" : "")} onClick={() => go(p)}>{p}</button>
        ))}
        <div className="card"><b>Account</b><div className="mut">{user.username} · {user.role}</div>
          <button className="btn o" style={{ width: "100%", marginTop: 8 }} onClick={() => setUser(null)}>Logout</button></div>
        <div className="card"><b>Accent colour</b><div className="dots">
          {ACCENTS.map((c) => (
            <span key={c} style={{ background: c }} onClick={() => document.documentElement.style.setProperty("--a1", c)} />
          ))}</div></div>
      </nav>

      <main onClick={() => setMenu(false)}>
        {page === "Dashboard" && (<>
          <h2>Dashboard</h2><div className="mut">Live attendance & results at a glance.</div>
          <div className="grid" style={{ marginTop: 12 }}>
            <div className="card"><div className="mut">Total Students</div><div className="big">{students.length}</div></div>
            <div className="card"><div className="mut">Avg Attendance</div><div className="big">
              {students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0}%</div></div>
            <div className="card"><div className="mut">Avg Marks</div><div className="big">
              {students.length ? Math.round(students.reduce((a, s) => a + avg(s), 0) / students.length) : 0}%</div></div>
            <div className="card"><div className="mut">Below 75%</div><div className="big" style={{ color: "var(--bad)" }}>{below.length}</div></div>
            <div className="card"><div className="mut">Fees Pending (₹)</div><div className="big">{pending.toLocaleString()}</div></div>
          </div>
        </>)}

        {page === "Students" && (<>
          <h2>Students</h2><div className="mut">Search and filter.</div>
          <input placeholder="🔍 Search name or roll" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="card"><table><thead><tr><th>Roll</th><th>Name</th><th>Dept</th><th>Sec</th><th>Att.</th></tr></thead><tbody>
            {students.filter((s) => (s.name + s.rollNo).toLowerCase().includes(q.toLowerCase())).map((s) => (
              <tr key={s.rollNo} className="c" onClick={() => { setSel(s.rollNo); go("Student Profile"); }}>
                <td>{s.rollNo}</td><td><b>{s.name}</b></td><td>{s.dept}</td><td>{s.section}</td>
                <td><span className={"pill " + (s.attendance >= 75 ? "g" : "r")}>{s.attendance}%</span></td></tr>
            ))}</tbody></table></div>
        </>)}

        {page === "Student Profile" && me && <Profile s={me} staff={staff} save={save} go={go} />}
        {page === "Marks Form" && me && <Marks key={me.rollNo} s={me} save={save} />}

        {page === "Timetable" && (<>
          <h2>Class Timetable</h2><div className="mut">Weekly schedule</div>
          <div className="tabs" style={{ marginTop: 12 }}>{DAYS.map((d) => (
            <button key={d} className={"btn" + (d === day ? " on" : "")} onClick={() => setDay(d)}>{d}</button>))}</div>
          {tt.length === 0 && <div className="card mut">No classes.</div>}
          {tt.map((t, i) => (
            <div key={i} className="card slot"><b style={{ color: "var(--a1)" }}>{t.SLOT}</b> &nbsp; <b>{t.SUBJECT}</b>
              <div className="mut">{t.FACULTY} · Room {t.ROOM}</div></div>))}
        </>)}

        {page === "Fees" && (<>
          <h2>Fees</h2>
          {(staff ? students : students.filter((s) => s.rollNo === user.username)).map((s) => (
            <div key={s.rollNo} className="card"><div className="row"><b>{s.name} · {s.rollNo}</b>
              <span className={"pill " + (s.feePaid >= s.feeTotal ? "g" : "r")}>
                {s.feePaid >= s.feeTotal ? "Paid" : "Pending ₹" + (s.feeTotal - s.feePaid)}</span></div>
              <div className="bar"><i style={{ width: (100 * s.feePaid) / s.feeTotal + "%" }} /></div>
              <div className="mut">₹{s.feePaid} of ₹{s.feeTotal}</div>
              {staff && s.feePaid < s.feeTotal && (
                <button className="btn o" style={{ marginTop: 8 }} onClick={() => save(s.rollNo, { feePaid: s.feeTotal }, "Marked paid ✓")}>Mark fully paid</button>)}
            </div>))}
        </>)}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function Profile({ s, staff, save, go }) {
  const [name, setName] = useState(s.name);
  useEffect(() => setName(s.name), [s.rollNo]);
  return (<>
    <div className="card" style={{ textAlign: "center" }}>
      <div className="grad" style={{ width: 70, height: 70, borderRadius: 18, margin: "auto", display: "grid", placeItems: "center", fontSize: 32 }}>{s.name[0]}</div>
      <h3>{s.name}</h3><div className="mut">{s.rollNo} · {s.dept} · {s.year}rd · Section {s.section}</div>
      <p><span className={"pill " + (s.attendance >= 75 ? "g" : "r")} style={{ fontSize: 22 }}>{s.attendance}%</span></p>
      <div className="mut">{s.attendance >= 75 ? "✅ Attendance on track" : "⚠️ Below 75%"}</div>
      {staff && (<>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn o" style={{ height: 44 }} onClick={() => save(s.rollNo, { name }, "Name updated ✓")}>Change name</button></div>
        <div className="mut" style={{ textAlign: "left" }}>Update attendance: {s.attendance}%</div>
        <input type="range" min="0" max="100" value={s.attendance}
          onChange={(e) => save(s.rollNo, { attendance: +e.target.value }, "Attendance saved")} />
        <button className="btn" style={{ width: "100%" }} onClick={() => go("Marks Form")}>Edit marks</button></>)}
    </div>
    <div className="card"><h3>Subject-wise Marks</h3>
      {[["Math", s.math], ["Programming", s.programming], ["DBMS", s.dbms]].map(([n, v]) => (
        <div key={n}><div className="row"><span>{n}</span><b>{v}</b></div><div className="bar"><i style={{ width: v + "%" }} /></div></div>))}
      <p><b>Overall:</b> {avg(s)}%</p></div>
  </>);
}

function Marks({ s, save }) {
  const [m, setM] = useState({ math: s.math, programming: s.programming, dbms: s.dbms });
  return (<>
    <h2>Marks Form</h2><div className="mut">Changes update the dashboard immediately.</div>
    <div className="card"><h3>Edit marks — {s.name}</h3><div className="mut">{s.rollNo}</div>
      {Object.keys(m).map((k) => (<div key={k}><label className="mut">{k}</label>
        <input type="number" min="0" max="100" value={m[k]} onChange={(e) => setM({ ...m, [k]: +e.target.value })} /></div>))}
      <button className="btn" onClick={() => save(s.rollNo, m, "Marks saved ✓")}>Save changes</button>{" "}
      <button className="btn o" onClick={() => setM({ math: s.math, programming: s.programming, dbms: s.dbms })}>Reset</button></div>
  </>);
}

function Login({ onLogin }) {
  const [type, setType] = useState("staff");
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    try { onLogin(await call("/login", "POST", { type, username, password })); }
    catch (e) { setErr(e.message === "Failed to fetch" ? "Backend not reachable" : e.message); }
  };
  return (
    <div className="login">
      <div className="hero grad"><h1>CampusHub</h1><p>Attendance, marks and fee management for students, faculty and management.</p></div>
      <div className="card" style={{ borderRadius: 0, margin: 0 }}>
        <h2>Welcome back</h2><div className="mut">Choose your login type to continue.</div>
        <div className="tabs" style={{ marginTop: 12 }}>
          <button className={"btn" + (type === "staff" ? " on" : "")} onClick={() => setType("staff")}>👨‍🏫 Faculty / Management</button>
          <button className={"btn" + (type === "student" ? " on" : "")} onClick={() => setType("student")}>🎓 Student</button></div>
        <label className="mut">Username</label>
        <input value={username} onChange={(e) => setU(e.target.value)} placeholder={type === "staff" ? "faculty or management" : "Roll no, e.g. A101"} />
        <label className="mut">Password</label>
        <input type="password" value={password} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Enter password" />
        {err && <div style={{ color: "var(--bad)", marginBottom: 8 }}>{err}</div>}
        <button className="btn" style={{ width: "100%" }} onClick={submit}>Login →</button>
        <p className="mut">Demo: faculty / faculty123 · management / admin123 · A101 / student123</p>
      </div>
    </div>
  );
}
