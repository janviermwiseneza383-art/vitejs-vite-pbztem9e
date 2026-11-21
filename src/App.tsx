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
  const [customMatches, setCustomMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_custom') || '[]'); } catch { return []; } });
  const [adBanner, setAdBanner] = useState(() => localStorage.getItem('kus_ad') || '📢 Advertise Here on Kigali Update Score • Contact Janvier Mwiseneza');
  const [form, setForm] = useState({ home: 'TTC Muhanga', away: 'TTC Kigali', hs: '2', as: '1', comp: 'TTC Schools Championship', venue: 'Muhanga Pitch', status: 'FINISHED' });

  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_v21') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f21') || '[]'); } catch { return []; } });
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
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('kus_v21', JSON.stringify(d.matches)); }
    }).catch(() => {});
  };

  useEffect(() => { load(lg); const i = setInterval(() => load(lg), 30000); return () => clearInterval(i); }, [lg, customMatches]);
  useEffect(() => { fetch(`/api/matches?type=standings&code=${sideLg}`).then(r => r.json()).then(d => setSideTbl((Array.isArray(d?.standings) ? d.standings.at(0)?.table : []) || [])).catch(() => {}); }, [sideLg]);

  const openAdmin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pin = window.prompt('Enter Admin PIN (Default: 2026):');
    if (pin === '2026') setIsAdmin(true);
    else if (pin !== null) alert('Wrong Admin PIN!');
  };

  const addCustomMatch = (e: any) => {
    e.preventDefault();
    const item = {
      id: Date.now(), competition: { name: form.comp, code: 'SCHOOL' }, status: form.status,
      utcDate: new Date().toISOString(), venue: form.venue,
      homeTeam: { id: Date.now() + 1, name: form.home, shortName: form.home },
      awayTeam: { id: Date.now() + 2, name: form.away, shortName: form.away },
      score: { fullTime: { home: form.status === 'TIMED' ? null : Number(form.hs), away: form.status === 'TIMED' ? null : Number(form.as) } },
    };
    const next = [item, ...customMatches];
    setCustomMatches(next);
    localStorage.setItem('kus_custom', JSON.stringify(next));
    alert('✅ Match added to Kigali Update Score!');
  };

  const delCustomMatch = (id: number) => {
    const next = customMatches.filter(x => x.id !== id);
    setCustomMatches(next);
    localStorage.setItem('kus_custom', JSON.stringify(next));
  };

  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f21', JSON.stringify(nx)); };

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

  const refObj = Array.isArray(det?.referees) ? det.referees.at(0) : null;
  const goals = Array.isArray(det?.goals) ? det.goals : [];

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={() => { setIsAdmin(false); setLg('ALL'); setSt('ALL'); }}><img src="/Kigali Update Score Sports Badge.png" alt="Logo" /><h1>KIGALI UPDATE SCORE</h1></div>
        <div className="top-acts">
          <button className="adm-btn" onClick={openAdmin}>{isAdmin ? '← Back to Live Scores' : '🔐 Admin'}</button>
          <div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div>
        </div>
      </div></header>

      {isAdmin ? (
        <main className="adm-wrap">
          <div className="stat-grid">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}><div style={{ fontSize: 24 }}>{allShown.length}</div><div>Total Active Matches</div></div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}><div style={{ fontSize: 24 }}>{customMatches.length}</div><div>Custom / School Matches</div></div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}><div style={{ fontSize: 24 }}>11</div><div>Leagues Covered</div></div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}><div style={{ fontSize: 24 }}>Active</div><div>AdSense / Sponsor Slot</div></div>
          </div>

          <div className="box">
            <div className="sec-lbl">+ ADD NEW MATCH (SCHOOL / LOCAL / CUSTOM)</div>
            <form onSubmit={addCustomMatch}>
              <div className="form-grid">
                <input className="inp" value={form.home} onChange={e => setForm({ ...form, home: e.target.value })} placeholder="Home Team (e.g. TTC Muhanga)" required />
                <input className="inp" value={form.away} onChange={e => setForm({ ...form, away: e.target.value })} placeholder="Away Team (e.g. TTC Kigali)" required />
                <input className="inp" value={form.comp} onChange={e => setForm({ ...form, comp: e.target.value })} placeholder="Competition (e.g. TTC Championship)" required />
                <input className="inp" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue / Stadium" />
                <input className="inp" type="number" value={form.hs} onChange={e => setForm({ ...form, hs: e.target.value })} placeholder="Home Score" />
                <input className="inp" type="number" value={form.as} onChange={e => setForm({ ...form, as: e.target.value })} placeholder="Away Score" />
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="FINISHED">Finished (FT)</option><option value="IN_PLAY">Live Now</option><option value="TIMED">Upcoming</option></select>
              </div>
              <button type="submit" className="btn-pri">💾 Save Match to Website</button>
            </form>
          </div>

          <div className="box">
            <div className="sec-lbl">MANAGE ADDED MATCHES ({customMatches.length})</div>
            {customMatches.length === 0 ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No custom matches added yet.</p> : customMatches.map(cm => (
              <div key={cm.id} className="ev"><span><strong>{cm.homeTeam.name}</strong> {cm.score.fullTime.home ?? '-'} - {cm.score.fullTime.away ?? '-'} <strong>{cm.awayTeam.name}</strong> ({cm.competition.name})</span><button className="btn-del" onClick={() => delCustomMatch(cm.id)}>Delete</button></div>
            ))}
          </div>

          <div className="box">
            <div className="sec-lbl">💰 MONETIZATION & ADS BANNER (DATA / WI-FI REVENUE)</div>
            <input className="inp" value={adBanner} onChange={e => { setAdBanner(e.target.value); localStorage.setItem('kus_ad', e.target.value); }} placeholder="Enter Sponsor Text or AdSense Tag..." />
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Tip: Connect Google AdSense or Adsterra script in index.html to earn automatically from every visitor using Mobile Data or Wi-Fi.</p>
          </div>
        </main>
      ) : (
        <main className="grid-3">
          <aside>
            <div className="box"><div className="sec-lbl">LIVE</div>{[{ id: 'ALL', l: t.all }, { id: 'LV', l: `🔴 ${t.lv}` }, { id: 'UP', l: t.up }, { id: 'FN', l: t.fn }, { id: 'FAV', l: `★ ${t.fav} (${favs.length})` }].map(b => <button key={b.id} className={`nav-item ${st === b.id ? 'act' : ''}`} onClick={() => setSt(b.id)}>{b.l}</button>)}</div>
            <div className="box"><div className="sec-lbl">POPULAR COMPETITIONS</div>{POPULAR.map(p => <button key={p.code} className={`nav-item ${lg === p.code ? 'act' : ''}`} onClick={() => { setLg(p.code); setSideLg(p.code === 'SCHOOL' ? 'RW1' : p.code); }}><CompLogo p={p} /><span>{p.name}</span></button>)}</div>
          </aside>
          <section>
            <div className="ad-box">{adBanner}</div>
            <div className="sec-lbl" style={{ paddingLeft: 4 }}>MATCHES ({list.length})</div>
           
                      {list.map(m => {
              const live = ['IN_PLAY', 'PAUSED'].includes(m.status), fin = m.status === 'FINISHED';
              return (<div key={m.id} className={`m-card ${live ? 'live' : ''}`} onClick={() => openMatch(m)}>
                <div className="m-top"><span style={{ fontWeight: 700, color: '#d4d4d4' }}>{m.competition?.name}</span><span>{new Date(m.utcDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span></div>
                <div className="m-row">
                  <span className={live ? 'tm-live' : ''} style={{ fontSize: 12, color: live ? '#ff6b00' : '#9ca3af' }}>{live ? `${m.minute || 'LIVE'}'` : fin ? 'FT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="tm h"><span>{m.homeTeam.shortName || m.homeTeam.name}</span><Crest tm={m.homeTeam} /></div>
                  <div className={`sc ${live ? 'live' : ''}`}>{m.score.fullTime.home ?? '-'} - {m.score.fullTime.away ?? '-'}</div>
                  <div className="tm"><Crest tm={m.awayTeam} /><span>{m.awayTeam.shortName || m.awayTeam.name}</span></div>
                  <button className={`star ${favs.includes(m.id) ? 'fav' : ''}`} onClick={e => toggleFav(e, m.id)}>{favs.includes(m.id) ? '★' : '☆'}</button>
                </div>
              </div>);
            })}
          </section>
          <aside><div className="box"><input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 ${t.s}`} /><select value={sideLg} onChange={e => setSideLg(e.target.value)} style={{ width: '100%', background: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '7px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>{POPULAR.filter(p => p.code !== 'SCHOOL').map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select><table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{sideTbl.slice(0, 12).map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left', fontWeight: 600 }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800, color: '#ff6b00' }}>{r.points}</td></tr>)}</tbody></table></div></aside>
        </main>
      )}
      {sel && (<div className="modal-bg" onClick={() => setSel(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-top"><strong>{sel.competition?.name}</strong><button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button></div>
        <div className="m-row" style={{ background: '#0b0b0b', padding: 14, borderRadius: 12, gridTemplateColumns: '1fr auto 1fr' }}><div className="tm h"><span>{sel.homeTeam.shortName || sel.homeTeam.name}</span><Crest tm={sel.homeTeam} /></div><div className="sc" style={{ fontSize: 20 }}>{sel.score.fullTime.home ?? '-'} - {sel.score.fullTime.away ?? '-'}</div><div className="tm"><Crest tm={sel.awayTeam} /><span>{sel.awayTeam.shortName || sel.awayTeam.name}</span></div></div>
        <div className="ls-tabs">{[{ id: 'INFO', l: t.inf }, { id: 'SUM', l: t.sum }, { id: 'LNP', l: t.lnp }, { id: 'TBL', l: t.tbl }, { id: 'H2H', l: t.h2h }].map(k => <button key={k.id} className={mTab === k.id ? 'act' : ''} onClick={() => setMTab(k.id as any)}>{k.l}</button>)}</div>
        {mTab === 'INFO' && (<div><div className="sec-lbl">MATCH INFO</div><div className="info-strip"><span>📅 {new Date(sel.utcDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span>🗣️ {refObj ? `${refObj.name}${refObj.nationality ? ` (${refObj.nationality})` : ''}` : 'Referee TBA'}</span><span>🏟️ {det?.venue || sel.venue || 'Stadium TBA'}</span></div></div>)}
        {mTab === 'SUM' && (goals.length > 0 ? goals.map((g: any, i: number) => <div key={i} className="ev"><span>⚽ <strong>{g.scorer?.name}</strong> ({g.team?.name})</span><strong style={{ color: '#ff6b00' }}>{g.minute}'</strong></div>) : <div><div className="ev"><span>🏆 <strong>Result:</strong> {sel.homeTeam.shortName} {sel.score.fullTime.home ?? 0} - {sel.score.fullTime.away ?? 0} {sel.awayTeam.shortName}</span><strong style={{ color: '#ff6b00' }}>{sel.status}</strong></div>{refObj && <div className="ev"><span>🗣️ Referee</span><strong>{refObj.name}</strong></div>}</div>)}
        {mTab === 'LNP' && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Line-ups released ~1h before kickoff.</p>}
        {mTab === 'TBL' && <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{mTbl.map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left' }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800 }}>{r.points}</td></tr>)}</tbody></table>}
        {mTab === 'H2H' && (h2h.length > 0 ? h2h.map((hm: any) => <div key={hm.id} className="ev"><span>{hm.utcDate?.slice(0, 10)}</span><span><strong>{hm.homeTeam?.shortName}</strong> {hm.score?.fullTime?.home ?? '-'} - {hm.score?.fullTime?.away ?? '-'} <strong>{hm.awayTeam?.shortName}</strong></span></div>) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No previous H2H matches.</p>)}
      </div></div>)}
      <footer>© {new Date().getFullYear()} <strong>KIGALI UPDATE SCORE</strong> • {t.dev}</footer>
    </div>
  );
}


