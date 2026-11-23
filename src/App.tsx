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
  { code: 'UEL', name: 'UEFA Europa League', bg: 'linear-gradient(135deg,#111 50%,#f97316 100%)', fg: '#fff', tag: 'UEL', img: '' },
  { code: 'PL', name: 'Premier League', bg: '#38003c', fg: '#00ff85', tag: 'PL', img: h('crests.football-data.org/PL.png') },
  { code: 'ELC', name: 'EFL Championship', bg: '#1d4ed8', fg: '#fff', tag: 'ELC', img: h('crests.football-data.org/ELC.png') },
  { code: 'PD', name: 'La Liga', bg: '#ee8707', fg: '#fff', tag: 'LL', img: h('crests.football-data.org/laliga.png') },
  { code: 'BL1', name: 'Bundesliga', bg: '#d20515', fg: '#fff', tag: 'BL', img: h('crests.football-data.org/BL1.png') },
  { code: 'SA', name: 'Serie A', bg: '#024494', fg: '#fff', tag: 'SA', img: h('crests.football-data.org/SA.png') },
  { code: 'BSA', name: 'Brasileirão Série A', bg: '#009c3b', fg: '#ffdf00', tag: 'BR', img: h('crests.football-data.org/bsa.png') },
  { code: 'FL1', name: 'Ligue 1', bg: '#dae025', fg: '#091c3e', tag: 'L1', img: h('crests.football-data.org/FL1.png') },
];

const RW_BADGES: Record<string, [string, string, string]> = {
  'APR FC': ['#000', '#fff', 'APR'], 'Rayon Sports': ['#1d4ed8', '#fff', 'RS'], 'Police': ['#1e3a8a', '#facc15', 'POL'],
  'Marines': ['#dc2626', '#fff', 'MAR'], 'Kiyovu Sports': ['#15803d', '#fff', 'KSC'], 'Al-Hilal': ['#0284c7', '#fff', 'HIL'],
  'Gicumbi': ['#16a34a', '#facc15', 'GIC'], 'Bugesera': ['#eab308', '#111', 'BUG'], 'Gasogi United': ['#b91c1c', '#facc15', 'GAS'],
  'Amagaju': ['#15803d', '#fff', 'AMA'], 'Musanze': ['#1e40af', '#fff', 'MUS'], "Etoile de l'Est": ['#dc2626', '#fff', 'ETO'],
  'Mukura': ['#eab308', '#111', 'MUK'], 'Gorilla': ['#15803d', '#fff', 'GOR'], 'Al-Merrikh': ['#dc2626', '#facc15', 'MER'],
};

const CompLogo = ({ p }: { p: any }) => {
  const [err, setErr] = useState(false);
  if (p.img && !err) return <img src={p.img} alt="" onError={() => setErr(true)} style={{ width: 22, height: 22, objectFit: 'contain', background: '#fff', borderRadius: 6, padding: 2, flexShrink: 0 }} />;
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: p.bg, color: p.fg, fontSize: p.tag.length > 2 ? 8 : 12, fontWeight: 900, flexShrink: 0 }}>{p.tag}</span>;
};

const Crest = ({ tm }: { tm: any }) => {
  const [err, setErr] = useState(false);
  const name = tm?.shortName || tm?.name || 'FC';
  if (tm?.crest && !err) return <img src={tm.crest} alt="" onError={() => setErr(true)} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />;
  const [bg, fg, txt] = RW_BADGES[name] || ['#0f766e', '#ffffff', name.slice(0, 3).toUpperCase()];
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 23, height: 23, borderRadius: '4px 4px 11px 11px', background: bg, color: fg, fontSize: 8, fontWeight: 900, border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0 }}>{txt}</span>;
};

export default function App() {
  const [lang, setLang] = useState<Lang>('ENG');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [clicks, setClicks] = useState(0);
  const [customMatches, setCustomMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_custom6') || '[]'); } catch { return []; } });
  const [adBanner, setAdBanner] = useState(() => localStorage.getItem('kus_ad6') || '📢 Advertise on Kigali Update Score • Instant Booking via MTN MoMo: 078XXXXXXX');
  const [momoNum, setMomoNum] = useState(() => localStorage.getItem('kus_momo') || '078XXXXXXX');
  const [form, setForm] = useState({ home: 'TTC Muhanga', away: 'TTC Kigali', hs: '2', as: '1', comp: 'TTC Schools Championship', venue: 'Muhanga Pitch', date: new Date().toISOString().slice(0, 16), status: 'TIMED', min: '90', added: '4', penH: '', penA: '' });
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_v30') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f30') || '[]'); } catch { return []; } });
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
    fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json()).then(d => {
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('kus_v30', JSON.stringify(d.matches)); }
    }).catch(() => {});
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
      utcDate: form.date ? new Date(form.date).toISOString() : new Date().toISOString(), venue: form.venue,
      homeTeam: { id: Date.now() + 1, name: form.home, shortName: form.home }, awayTeam: { id: Date.now() + 2, name: form.away, shortName: form.away },
      score: { duration: hasPen ? 'PENALTY_SHOOTOUT' : 'REGULAR', fullTime: { home: form.status === 'TIMED' ? null : Number(form.hs), away: form.status === 'TIMED' ? null : Number(form.as) }, penalties: hasPen ? { home: Number(form.penH), away: Number(form.penA) } : null },
    };
    const next = [item, ...customMatches]; setCustomMatches(next); localStorage.setItem('kus_custom6', JSON.stringify(next)); alert('✅ Match saved!');
  };

  const delCustomMatch = (id: number) => { const next = customMatches.filter(x => x.id !== id); setCustomMatches(next); localStorage.setItem('kus_custom6', JSON.stringify(next)); };
  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f30', JSON.stringify(nx)); };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    if (m.competition?.code === 'SCHOOL') return;
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

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={handleBrandClick}><img src="/Kigali Update Score Sports Badge.png" alt="Logo" /><h1>KIGALI UPDATE SCORE</h1></div>
        <div className="top-acts">{isAdmin && <button className="adm-btn" onClick={() => setIsAdmin(false)}>← Exit Admin</button>}<div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div></div>
      </div></header>

      {showLogin && (<div className="modal-bg" onClick={() => setShowLogin(false)}><form className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()} onSubmit={handleLogin}><div className="sec-lbl">🔐 ADMIN LOGIN (JANVIER ONLY)</div><input className="inp" type="password" value={passInput} onChange={e => setPassInput(e.target.value)} placeholder="••••••••••••" autoFocus required /><div style={{ display: 'flex', gap: 8 }}><button type="submit" className="btn-pri" style={{ flex: 1 }}>Login</button><button type="button" className="btn-del" style={{ padding: '10px 14px', fontSize: 13 }} onClick={() => setShowLogin(false)}>Cancel</button></div></form></div>)}

      {isAdmin ? (
        <main className="adm-wrap">
          <div className="box"><div className="sec-lbl">+ ADD NEW MATCH (DATE, TIME, ADDED TIME & PENALTIES)</div>
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
            </div><button type="submit" className="btn-pri">💾 Save Match</button></form>
          </div>
          <div className="box"><div className="sec-lbl">MANAGE ADDED MATCHES ({customMatches.length})</div>{customMatches.map(cm => <div key={cm.id} className="ev"><span><strong>{cm.homeTeam.name}</strong> {cm.score.fullTime.home ?? '-'} - {cm.score.fullTime.away ?? '-'} <strong>{cm.awayTeam.name}</strong> ({new Date(cm.utcDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})</span><button className="btn-del" onClick={() => delCustomMatch(cm.id)}>Delete</button></div>)}</div>
          <div className="box"><div className="sec-lbl">💰 MOMO SPONSORSHIP & ADS BANNER</div><input className="inp" value={momoNum} onChange={e => { setMomoNum(e.target.value); localStorage.setItem('kus_momo', e.target.value); const txt = `📢 Advertise on Kigali Update Score • Pay via MTN MoMo: ${e.target.value}`; setAdBanner(txt); localStorage.setItem('kus_ad6', txt); }} placeholder="Your MTN MoMo Number" /><input className="inp" value={adBanner} onChange={e => { setAdBanner(e.target.value); localStorage.setItem('kus_ad6', e.target.value); }} placeholder="Banner Text" /></div>
        </main>
      ) : (
        <main className="grid-3">
                   <aside><div className="box"><input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 ${t.s}`} /><select value={sideLg} onChange={e => setSideLg(e.target.value)} style={{ width: '100%', background: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '7px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>{POPULAR.filter(p => p.code !== 'SCHOOL').map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select><table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{sideTbl.map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left', fontWeight: 600 }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800, color: '#ff6b00' }}>{r.points}</td></tr>)}</tbody></table></div></aside>
        </main>
      )}
      {sel && (<div className="modal-bg" onClick={() => setSel(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="m-top"><strong>{sel.competition?.name}</strong><button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button></div><div className="m-row" style={{ background: '#0b0b0b', padding: 14, borderRadius: 12, gridTemplateColumns: '1fr auto 1fr' }}><div className="tm h"><span>{sel.homeTeam.shortName || sel.homeTeam.name}</span><Crest tm={sel.homeTeam} /></div><div className="sc" style={{ fontSize: 20 }}><div>{sel.score.fullTime.home ?? '-'} - {sel.score.fullTime.away ?? '-'}</div>{(sel.score?.penalties && sel.score.penalties.home !== null) && <div style={{ fontSize: 11, color: '#facc15' }}>Penalties: {sel.score.penalties.home} - {sel.score.penalties.away}</div>}</div><div className="tm"><Crest tm={sel.awayTeam} /><span>{sel.awayTeam.shortName || sel.awayTeam.name}</span></div></div><div className="ls-tabs">{[{ id: 'INFO', l: t.inf }, { id: 'SUM', l: t.sum }, { id: 'LNP', l: t.lnp }, { id: 'TBL', l: t.tbl }, { id: 'H2H', l: t.h2h }].map(k => <button key={k.id} className={mTab === k.id ? 'act' : ''} onClick={() => setMTab(k.id as any)}>{k.l}</button>)}</div>{mTab === 'INFO' && (<div><div className="sec-lbl">MATCH INFO</div><div className="info-strip"><span>📅 {new Date(sel.utcDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span><span>🗣️ {det?.referees?.at(0) ? det.referees.at(0).name : 'Referee TBA'}</span><span>🏟️ {det?.venue || sel.venue || 'Stadium TBA'}</span></div></div>)}{mTab === 'SUM' && (<div><div className="ev"><span>🏆 <strong>Result:</strong> {sel.homeTeam.shortName} {sel.score.fullTime.home ?? 0} - {sel.score.fullTime.away ?? 0} {sel.awayTeam.shortName}</span><strong style={{ color: '#ff6b00' }}>{formatStatus(sel)}</strong></div>{(sel.score?.penalties && sel.score.penalties.home !== null) && <div className="ev"><span>🎯 Penalty Shootout</span><strong style={{ color: '#facc15' }}>{sel.score.penalties.home} - {sel.score.penalties.away}</strong></div>}</div>)}{mTab === 'LNP' && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Line-ups released ~1h before kickoff.</p>}{mTab === 'TBL' && <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{mTbl.map((r: any) => <tr key={r.position} style={{ background: [sel.homeTeam.id, sel.awayTeam.id].includes(r.team?.id) ? '#262626' : '' }}><td>{r.position}</td><td style={{ textAlign: 'left' }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800 }}>{r.points}</td></tr>)}</tbody></table>}{mTab === 'H2H' && (h2h.length > 0 ? h2h.map((hm: any) => <div key={hm.id} className="ev"><span>{hm.utcDate?.slice(0, 10)}</span><span><strong>{hm.homeTeam?.shortName}</strong> {hm.score?.fullTime?.home ?? '-'} - {hm.score?.fullTime?.away ?? '-'} <strong>{hm.awayTeam?.shortName}</strong></span></div>) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No previous H2H matches.</p>)}</div></div>)}
      <footer>© {new Date().getFullYear()} <strong>KIGALI UPDATE SCORE</strong> • {t.dev}</footer>
    </div>
  );
}


