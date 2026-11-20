import { useState, useEffect } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';
const TXT: Record<Lang, any> = {
  KINY: { all: 'All', lv: 'Live', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Shakisha ikipe...', inf: 'Info', lnp: 'Line-ups', tbl: 'Table', h2h: 'H2H', sum: 'Summary', dev: 'Yakozwe na Janvier Mwiseneza' },
  ENG: { all: 'All', lv: 'Live', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Search teams...', inf: 'Info', lnp: 'Line-ups', tbl: 'Table', h2h: 'H2H', sum: 'Summary', dev: 'Designed by Janvier Mwiseneza' },
  FRA: { all: 'Tous', lv: 'Direct', up: 'À Venir', fn: 'Terminés', fav: 'Favoris', s: 'Rechercher...', inf: 'Infos', lnp: 'Compos', tbl: 'Classement', h2h: 'H2H', sum: 'Résumé', dev: 'Conçu par Janvier Mwiseneza' },
};

const POPULAR = [
  { code: 'RW1', name: 'Rwanda Premier League', emblem: 'https://football-data.org' },
  { code: 'CL', name: 'UEFA Champions League', emblem: 'https://football-data.org' },
  { code: 'PL', name: 'Premier League', emblem: 'https://football-data.org' },
  { code: 'PD', name: 'La Liga', emblem: 'https://football-data.org' },
  { code: 'BL1', name: 'Bundesliga', emblem: 'https://football-data.org' },
  { code: 'SA', name: 'Serie A', emblem: 'https://football-data.org' },
  { code: 'BSA', name: 'Brasileirão Série A', emblem: 'https://football-data.org' },
  { code: 'FL1', name: 'Ligue 1', emblem: 'https://football-data.org' },
];

const fallback = (n = 'FC') => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://w3.org" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1e293b" stroke="#475569" stroke-width="2"/><text x="20" y="24" font-family="Arial" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">${n.slice(0, 3).toUpperCase()}</text></svg>`)}`;

export default function App() {
  const [lang, setLang] = useState<Lang>('ENG');
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_v9') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f9') || '[]'); } catch { return []; } });
  const [lg, setLg] = useState('ALL');
  const [st, setSt] = useState('ALL');
  const [q, setQ] = useState('');
  const [sideLg, setSideLg] = useState('PL');
  const [sideTbl, setSideTbl] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [mTab, setMTab] = useState<'INFO' | 'LNP' | 'TBL' | 'H2H' | 'SUM'>('INFO');
  const [det, setDet] = useState<any>(null);
  const [mTbl, setMTbl] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any[]>([]);
  const t = TXT[lang];

  const load = (c = lg) => {
    fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json()).then(d => {
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('kus_v9', JSON.stringify(d.matches)); }
    }).catch(() => {});
  };

  useEffect(() => { load(lg); const i = setInterval(() => load(lg), 30000); return () => clearInterval(i); }, [lg]);
  useEffect(() => { fetch(`/api/matches?type=standings&code=${sideLg}`).then(r => r.json()).then(d => setSideTbl((Array.isArray(d?.standings) ? d.standings.at(0)?.table : []) || [])).catch(() => {}); }, [sideLg]);

  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f9', JSON.stringify(nx)); };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    const [d1, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
  };

  const list = matches.filter(m => {
    if (st === 'FAV' && !favs.includes(m.id)) return false;
    const s = q.trim().toLowerCase();
    if (s && ![m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s))) return false;
    if (st === 'LV') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (st === 'UP') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (st === 'FN') return m.status === 'FINISHED';
    return true;
  });

  const crest = (tm: any) => tm?.crest || fallback(tm?.shortName || tm?.name);
  const refObj = Array.isArray(det?.referees) ? det.referees.at(0) : null;

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={() => { setLg('ALL'); setSt('ALL'); }}><img src="/Kigali Update Score Sports Badge.png" alt="Logo" /><h1>KIGALI UPDATE SCORE</h1></div>
        <div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div>
      </div></header>

      <main className="grid-3">
        <aside>
          <div className="box"><div className="sec-lbl">LIVE</div>{[{ id: 'ALL', l: t.all }, { id: 'LV', l: `🔴 ${t.lv}` }, { id: 'UP', l: t.up }, { id: 'FN', l: t.fn }, { id: 'FAV', l: `★ ${t.fav} (${favs.length})` }].map(b => <button key={b.id} className={`nav-item ${st === b.id ? 'act' : ''}`} onClick={() => setSt(b.id)}>{b.l}</button>)}</div>
          <div className="box"><div className="sec-lbl">POPULAR COMPETITIONS</div>{POPULAR.map(p => <button key={p.code} className={`nav-item ${lg === p.code ? 'act' : ''}`} onClick={() => { setLg(p.code); setSideLg(p.code); }}><img src={p.emblem} alt="" /> <span>{p.name}</span></button>)}</div>
        </aside>

        <section>
          <div className="sec-lbl" style={{ paddingLeft: 4 }}>MATCHES ({list.length})</div>
          {list.length === 0 ? <div className="box" style={{ textAlign: 'center', color: '#9ca3af', padding: 30 }}>No matches found.</div> : list.map(m => {
            const live = ['IN_PLAY', 'PAUSED'].includes(m.status), fin = m.status === 'FINISHED';
            const tmTxt = live ? `${m.minute || 'LIVE'}'` : fin ? 'FT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (<div key={m.id} className={`m-card ${live ? 'live' : ''}`} onClick={() => openMatch(m)}>
              <div className="m-top"><span style={{ fontWeight: 700, color: '#d4d4d4' }}>{m.competition?.name}</span><span>{new Date(m.utcDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              <div className="m-row">
                <span className={live ? 'tm-live' : ''} style={{ fontSize: 12, color: live ? '#ff6b00' : '#9ca3af' }}>{tmTxt}</span>
                <div className="tm h"><span>{m.homeTeam.shortName || m.homeTeam.name}</span><img src={crest(m.homeTeam)} alt="" /></div>
                <div className={`sc ${live ? 'live' : ''}`}>{m.score.fullTime.home ?? '-'} - {m.score.fullTime.away ?? '-'}</div>
                <div className="tm"><img src={crest(m.awayTeam)} alt="" /><span>{m.awayTeam.shortName || m.awayTeam.name}</span></div>
                <button className={`star ${favs.includes(m.id) ? 'fav' : ''}`} onClick={e => toggleFav(e, m.id)}>{favs.includes(m.id) ? '★' : '☆'}</button>
              </div>
            </div>);
          })}
        </section>

        <aside><div className="box">
          <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 ${t.s}`} />
          <select value={sideLg} onChange={e => setSideLg(e.target.value)} style={{ width: '100%', background: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '7px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>{POPULAR.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select>
          <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{sideTbl.slice(0, 12).map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left', fontWeight: 600 }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800, color: '#ff6b00' }}>{r.points}</td></tr>)}</tbody></table>
        </div></aside>
      </main>

      {sel && (<div className="modal-bg" onClick={() => setSel(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-top"><strong>{sel.competition?.name}</strong><button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button></div>
        <div className="m-row" style={{ background: '#0b0b0b', padding: 14, borderRadius: 12, gridTemplateColumns: '1fr auto 1fr' }}>
          <div className="tm h"><span>{sel.homeTeam.shortName || sel.homeTeam.name}</span><img src={crest(sel.homeTeam)} alt="" /></div>
          <div className="sc" style={{ fontSize: 20 }}>{sel.score.fullTime.home ?? '-'} - {sel.score.fullTime.away ?? '-'}</div>
          <div className="tm"><img src={crest(sel.awayTeam)} alt="" /><span>{sel.awayTeam.shortName || sel.awayTeam.name}</span></div>
        </div>
        <div className="ls-tabs">{[{ id: 'INFO', l: t.inf }, { id: 'LNP', l: t.lnp }, { id: 'TBL', l: t.tbl }, { id: 'H2H', l: t.h2h }, { id: 'SUM', l: t.sum }].map(k => <button key={k.id} className={mTab === k.id ? 'act' : ''} onClick={() => setMTab(k.id as any)}>{k.l}</button>)}</div>
