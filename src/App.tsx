import { useState, useEffect } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';
const TXT: Record<Lang, any> = {
  KINY: { all: 'All', lv: 'Live', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Shakisha...', inf: 'Info', lnp: 'Line-ups', tbl: 'Table', h2h: 'H2H', sum: 'Summary', dev: 'Yakozwe na Janvier Mwiseneza' },
  ENG: { all: 'All', lv: 'Live', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Search...', inf: 'Info', lnp: 'Line-ups', tbl: 'Table', h2h: 'H2H', sum: 'Summary', dev: 'Designed by Janvier Mwiseneza' },
  FRA: { all: 'Tous', lv: 'Direct', up: 'À Venir', fn: 'Terminés', fav: 'Favoris', s: 'Rechercher...', inf: 'Infos', lnp: 'Compos', tbl: 'Classement', h2h: 'H2H', sum: 'Résumé', dev: 'Conçu par Janvier Mwiseneza' },
};

const h = (u: string) => ['https', '//' + u].join(':');
const POPULAR = [
  { code: 'RW1', name: 'Rwanda Premier League', bg: 'linear-gradient(180deg,#00a1de 45%,#fad201 75%,#20603d 100%)', fg: '#111', tag: '🇷🇼', img: '' },
  { code: 'SCHOOL', name: 'Schools & Local Matches', bg: 'linear-gradient(135deg,#059669,#10b981)', fg: '#fff', tag: '🏫', img: '' },
  { code: 'CL', name: 'UEFA Champions League', bg: '#0e1e5b', fg: '#fff', tag: 'UCL', img: h('crests.football-data.org/CL.png') },
  { code: 'PL', name: 'Premier League', bg: '#38003c', fg: '#00ff85', tag: 'PL', img: h('crests.football-data.org/PL.png') },
  { code: 'PD', name: 'La Liga', bg: '#ee8707', fg: '#fff', tag: 'LL', img: h('crests.football-data.org/laliga.png') },
  { code: 'BL1', name: 'Bundesliga', bg: '#d20515', fg: '#fff', tag: 'BL', img: h('crests.football-data.org/BL1.png') },
  { code: 'SA', name: 'Serie A', bg: '#024494', fg: '#fff', tag: 'SA', img: h('crests.football-data.org/SA.png') },
  { code: 'FL1', name: 'Ligue 1', bg: '#dae025', fg: '#091c3e', tag: 'L1', img: h('crests.football-data.org/FL1.png') },
  { code: 'ELC', name: 'EFL Championship', bg: '#1d4ed8', fg: '#fff', tag: 'ELC', img: h('crests.football-data.org/ELC.png') },
  { code: 'BSA', name: 'Brasileirão Série A', bg: '#009c3b', fg: '#ffdf00', tag: 'BR', img: h('crests.football-data.org/bsa.png') },
];

const ALL_SPORTS = [
  { code: 'BASKET', name: 'Basketball / NBA', tag: '🏀', bg: '#ea580c' },
  { code: 'VOLLEY', name: 'Volleyball', tag: '🏐', bg: '#0284c7' },
  { code: 'RUGBY', name: 'Rugby', tag: '🏉', bg: '#15803d' },
  { code: 'HANDBALL', name: 'Handball', tag: '🤾', bg: '#7c3aed' },
  { code: 'HOCKEY', name: 'Ice Hockey', tag: '🏒', bg: '#0f766e' },
  { code: 'NFL', name: 'NFL Football', tag: '🏈', bg: '#991b1b' },
  { code: 'BASEBALL', name: 'Baseball', tag: '⚾', bg: '#1d4ed8' },
  { code: 'MMA', name: 'UFC / MMA', tag: '🥊', bg: '#b91c1c' },
  { code: 'F1', name: 'Formula 1', tag: '🏎️', bg: '#dc2626' },
];

const CompLogo = ({ p }: { p: any }) => {
  const [err, setErr] = useState(false);
  if (p.img && !err) return <img src={p.img} alt="" onError={() => setErr(true)} style={{ width: 22, height: 22, objectFit: 'contain', background: '#fff', borderRadius: 6, padding: 2, flexShrink: 0 }} />;
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: p.bg, color: p.fg || '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{p.tag}</span>;
};

const Crest = ({ tm }: { tm: any }) => {
  const [err, setErr] = useState(false);
  const name = tm?.shortName || tm?.name || 'FC';
  if (tm?.crest && !err) return <img src={tm.crest} alt="" onError={() => setErr(true)} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />;
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 23, height: 23, borderRadius: '4px 4px 11px 11px', background: '#0f766e', color: '#fff', fontSize: 8, fontWeight: 900, border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0 }}>{name.slice(0, 3).toUpperCase()}</span>;
};

export default function App() {
  const [lang, setLang] = useState<Lang>('ENG');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [clicks, setClicks] = useState(0);
  const [customMatches, setCustomMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_c9') || '[]'); } catch { return []; } });
  const [adBanner, setAdBanner] = useState(() => localStorage.getItem('kus_a9') || '📢 Advertise on Kigali Update Score • Instant Booking via MTN MoMo: 078XXXXXXX');
  const [momoNum, setMomoNum] = useState(() => localStorage.getItem('kus_momo') || '078XXXXXXX');
  const [form, setForm] = useState({ home: 'TTC Muhanga', away: 'G.S Shyogwe', hs: '2', as: '1', comp: 'Schools Championship', venue: 'Shyogwe Pitch', date: new Date().toISOString().slice(0, 16), status: 'FINISHED', min: '90', added: '4', penH: '', penA: '', lnpH: '1. Jean, 2. Eric, 3. Claude, 4. Patrick, 5. Kevin', lnpA: '1. Bosco, 2. Pacifique, 3. Thierry, 4. Olivier, 5. Samuel' });
  const [matches, setMatches] = useState<any[]>([]);
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f9') || '[]'); } catch { return []; } });
  const [lg, setLg] = useState('ALL');
  const [st, setSt] = useState('ALL');
  const [q, setQ] = useState('');
  const [sideLg, setSideLg] = useState('RW1');
  const [sideTbl, setSideTbl] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [mTab, setMTab] = useState<'INFO' | 'LNP' | 'TBL' | 'H2H' | 'SUM'>('INFO');
  const [det, setDet] = useState<any>(null);
  const [mTbl, setMTbl] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any[]>([]);
  const t = TXT[lang];

    const load = (c = lg) => {
    if (c === 'SCHOOL') { setMatches(customMatches); return; }
    fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json()).then(d => { if (Array.isArray(d.matches)) setMatches(d.matches); }).catch(() => {});
  };

  useEffect(() => { if (window.location.search.includes('admin=1')) setShowLogin(true); load(lg); const i = setInterval(() => load(lg), 30000); return () => clearInterval(i); }, [lg, customMatches]);
  useEffect(() => { fetch(`/api/matches?type=standings&code=${sideLg}`).then(r => r.json()).then(d => setSideTbl((Array.isArray(d?.standings) ? d.standings.at(0)?.table : []) || [])).catch(() => {}); }, [sideLg]);

  const handleBrandClick = () => { setIsAdmin(false); setLg('ALL'); setSt('ALL'); const nx = clicks + 1; if (nx >= 3) { setShowLogin(true); setClicks(0); } else setClicks(nx); };
  const handleLogin = (e: any) => { e.preventDefault(); if (passInput === 'Janvier@2008') { setIsAdmin(true); setShowLogin(false); setPassInput(''); } else alert('Wrong Admin Password!'); };

  const addCustomMatch = (e: any) => {
    e.preventDefault();
    const hasPen = form.penH !== '' && form.penA !== '';
    const item = {
      id: Date.now(), competition: { name: form.comp, code: 'SCHOOL' }, status: form.status, minute: form.min, injuryTime: form.added ? Number(form.added) : null,
      utcDate: form.date ? new Date(form.date).toISOString() : new Date().toISOString(), venue: form.venue, lnpH: form.lnpH, lnpA: form.lnpA,
      homeTeam: { id: Date.now() + 1, name: form.home, shortName: form.home }, awayTeam: { id: Date.now() + 2, name: form.away, shortName: form.away },
      score: { duration: hasPen ? 'PENALTY_SHOOTOUT' : 'REGULAR', fullTime: { home: form.status === 'TIMED' ? null : Number(form.hs), away: form.status === 'TIMED' ? null : Number(form.as) }, penalties: hasPen ? { home: Number(form.penH), away: Number(form.penA) } : null },
    };
    const next = [item, ...customMatches]; setCustomMatches(next); localStorage.setItem('kus_c9', JSON.stringify(next)); alert('✅ Match & Line-ups saved!');
  };

  const delCustomMatch = (id: number) => { const next = customMatches.filter(x => x.id !== id); setCustomMatches(next); localStorage.setItem('kus_c9', JSON.stringify(next)); };
  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f9', JSON.stringify(nx)); };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    if (['SCHOOL', 'BASKET', 'VOLLEY', 'RUGBY', 'HANDBALL', 'HOCKEY', 'NFL', 'BASEBALL', 'MMA', 'F1', 'LIVE'].includes(m.competition?.code)) return;
    const [d1, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
  };

  const allShown = lg === 'ALL' ? [...customMatches, ...matches] : matches;
  const list = allShown.filter(m => {
    if (st === 'FAV' && !favs.includes(m.id)) return false;
    const s = q.trim().toLowerCase();
    if (s && ![m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s))) return false;
    if (st === 'LV') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (st === 'UP') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (st === 'FN') return m.status === 'FINISHED';
    return true;
  });

  const formatStatus = (m: any) => {
    const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
    const hasPen = m.score?.duration === 'PENALTY_SHOOTOUT' || (m.score?.penalties && m.score.penalties.home !== null);
    if (live) return `${m.minute || 'LIVE'}${m.injuryTime ? `+${m.injuryTime}` : ''}'`;
    if (m.status === 'FINISHED') return hasPen ? 'PEN' : 'FT';
    return new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderLineups = () => {
    const apiH = det?.homeTeam?.lineup || [];
    const apiA = det?.awayTeam?.lineup || [];
    const hList = apiH.length > 0 ? apiH.map((p: any) => `${p.shirtNumber || ''} ${p.name}`) : (sel?.lnpH ? sel.lnpH.split(',').map((s: string) => s.trim()) : []);
    const aList = apiA.length > 0 ? apiA.map((p: any) => `${p.shirtNumber || ''} ${p.name}`) : (sel?.lnpA ? sel.lnpA.split(',').map((s: string) => s.trim()) : []);
    if (hList.length === 0 && aList.length === 0) return <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Line-ups released ~1h before kickoff (or added in Admin).</p>;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><div className="sec-lbl">{sel?.homeTeam?.shortName}</div>{hList.map((p: string, i: number) => <div key={i} className="ev"><span>👕 {p}</span></div>)}</div>
        <div><div className="sec-lbl">{sel?.awayTeam?.shortName}</div>{aList.map((p: string, i: number) => <div key={i} className="ev"><span>👕 {p}</span></div>)}</div>
      </div>
    );
  };

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={handleBrandClick}><img src="/Kigali Update Score Sports Badge.png" alt="Logo" /><h1>KIGALI UPDATE SCORE</h1></div>
        <div className="top-acts">{isAdmin && <button className="adm-btn" onClick={() => setIsAdmin(false)}>← Exit Admin</button>}<div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div></div>
      </div></header>

      {showLogin && (<div className="modal-bg" onClick={() => setShowLogin(false)}><form className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()} onSubmit={handleLogin}><div className="sec-lbl">🔐 ADMIN LOGIN (JANVIER ONLY)</div><input className="inp" type="password" value={passInput} onChange={e => setPassInput(e.target.value)} placeholder="••••••••••••" autoFocus required /><div style={{ display: 'flex', gap: 8 }}><button type="submit" className="btn-pri" style={{ flex: 1 }}>Login</button><button type="button" className="btn-del" style={{ padding: '10px 14px', fontSize: 13 }} onClick={() => setShowLogin(false)}>Cancel</button></div></form></div>)}

      {isAdmin ? (
        <main className="adm-wrap">
          <div className="box"><div className="sec-lbl">+ ADD NEW MATCH (DATE, TIME, LINE-UPS & PENALTIES)</div>
            <form onSubmit={addCustomMatch}><div className="form-grid">
              <input className="inp" value={form.home} onChange={e => setForm({ ...form, home: e.target.value })} placeholder="Home Team" required />
              <input className="inp" value={form.away} onChange={e => setForm({ ...form, away: e.target.value })} placeholder="Away Team" required />
              <input className="inp" value={form.comp} onChange={e => setForm({ ...form, comp: e.target.value })} placeholder="Competition" required />
              <input className="inp" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <input className="inp" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue / Pitch" />
              <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="TIMED">Upcoming (Scheduled)</option><option value="IN_PLAY">Live Now</option><option value="FINISHED">Finished (FT / PEN)</option></select>
              <input className="inp" type="number" value={form.hs} onChange={e => setForm({ ...form, hs: e.target.value })} placeholder="Home Goals" />
              <input className="inp" type="number" value={form.as} onChange={e => setForm({ ...form, as: e.target.value })} placeholder="Away Goals" />
              <input className="inp" type="number" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder="Minute (90)" />
              <input className="inp" type="number" value={form.added} onChange={e => setForm({ ...form, added: e.target.value })} placeholder="Added Time (+4)" />
              <input className="inp" type="number" value={form.penH} onChange={e => setForm({ ...form, penH: e.target.value })} placeholder="Home Pen (optional)" />
              <input className="inp" type="number" value={form.penA} onChange={e => setForm({ ...form, penA: e.target.value })} placeholder="Away Pen (optional)" />
              <input className="inp" value={form.lnpH} onChange={e => setForm({ ...form, lnpH: e.target.value })} placeholder="Home Line-up (comma separated)" />
              <input className="inp" value={form.lnpA} onChange={e => setForm({ ...form, lnpA: e.target.value })} placeholder="Away Line-up (comma separated)" />
            </div><button type="submit" className="btn-pri">💾 Save Match & Line-ups</button></form>
          </div>
          <div className="box"><div className="sec-lbl">MANAGE ADDED MATCHES ({customMatches.length})</div>{customMatches.map(cm => <div key={cm.id} className="ev"><span><strong>{cm.homeTeam.name}</strong> {cm.score.fullTime.home ?? '-'} - {cm.score.fullTime.away ?? '-'} <strong>{cm.awayTeam.name}</strong> ({new Date(cm.utcDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})</span><button className="btn-del" onClick={() => delCustomMatch(cm.id)}>Delete</button></div>)}</div>

