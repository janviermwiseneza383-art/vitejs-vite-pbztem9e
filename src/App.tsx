import { useState, useEffect } from 'react';
import './index.css';

type Lang = 'KINY' | 'ENG' | 'FRA';
const TXT: Record<Lang, any> = {
  KINY: { all: 'Yose', lv: 'LIVE', up: 'Izaba', fn: 'Yarangiye', fav: 'Favourites', s: 'Shakisha ikipe, irushanwa...', tbl: 'Urutonde', scr: 'Abatsinze', inf: 'Info', sum: 'Summary', sts: 'Stats', lnp: 'Line-ups', h2h: 'H2H', dev: 'Yakozwe na Janvier Mwiseneza' },
  ENG: { all: 'All', lv: 'LIVE', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Search team, competition...', tbl: 'Table', scr: 'Top Scorers', inf: 'Info', sum: 'Summary', sts: 'Stats', lnp: 'Line-ups', h2h: 'H2H', dev: 'Designed by Janvier Mwiseneza' },
  FRA: { all: 'Tous', lv: 'DIRECT', up: 'À Venir', fn: 'Terminés', fav: 'Favoris', s: 'Rechercher équipe, ligue...', tbl: 'Classement', scr: 'Buteurs', inf: 'Infos', sum: 'Résumé', sts: 'Stats', lnp: 'Compos', h2h: 'H2H', dev: 'Conçu par Janvier Mwiseneza' },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [sport, setSport] = useState('Football');
  const [comps, setComps] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('ls_c') || '[]'); } catch { return []; } });
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('ls_m') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('ls_f') || '[]'); } catch { return []; } });
  const [onlyFav, setOnlyFav] = useState(false);
  const [lg, setLg] = useState('ALL');
  const [stFilter, setStFilter] = useState('ALL');
  const [q, setQ] = useState('');
  const [sideTab, setSideTab] = useState<'TBL' | 'SCR'>('TBL');
  const [sideLg, setSideLg] = useState('RW1');
  const [sideTbl, setSideTbl] = useState<any[]>([]);
  const [sideScr, setSideScr] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [mTab, setMTab] = useState<'INFO' | 'SUM' | 'STS' | 'LNP' | 'TBL' | 'H2H'>('SUM');
  const [det, setDet] = useState<any>(null);
  const [mTbl, setMTbl] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any[]>([]);
  const t = TXT[lang];

  useEffect(() => {
    fetch('/api/matches?type=competitions').then(r => r.json()).then(d => {
      if (Array.isArray(d.competitions)) { setComps(d.competitions); localStorage.setItem('ls_c', JSON.stringify(d.competitions)); }
    }).catch(() => {});
  }, []);

  const loadMatches = (c = lg) => {
    fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json()).then(d => {
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('ls_m', JSON.stringify(d.matches)); }
    }).catch(() => {});
  };

  useEffect(() => { loadMatches(lg); const i = setInterval(() => loadMatches(lg), 30000); return () => clearInterval(i); }, [lg]);

  useEffect(() => {
    const ep = sideTab === 'TBL' ? 'standings' : 'scorers';
    fetch(`/api/matches?type=${ep}&code=${sideLg}`).then(r => r.json()).then(d => {
      if (sideTab === 'TBL') setSideTbl((Array.isArray(d?.standings) ? d.standings.at(0)?.table : []) || []);
      else setSideScr(d?.scorers || []);
    }).catch(() => {});
  }, [sideTab, sideLg]);

  const toggleFav = (e: any, id: number) => {
    e.stopPropagation();
    const next = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem('ls_f', JSON.stringify(next));
  };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('SUM'); setDet(null); setMTbl([]); setH2h([]);
    const [d1, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
  };

  const list = matches.filter(m => {
    if (onlyFav && !favs.includes(m.id)) return false;
    const s = q.trim().toLowerCase();
    if (s && ![m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s))) return false;
    if (stFilter === 'LV') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (stFilter === 'UP') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (stFilter === 'FN') return m.status === 'FINISHED';
    return true;
  });

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={() => { setLg('ALL'); setOnlyFav(false); }}>
          <img src="/Kigali Update Score Sports Badge.png" alt="Logo" />
          <div className="brand-txt"><h1>Kigali Update Score</h1><span>LIVE SCORES & RESULTS</span></div>
        </div>
        <div className="top-right">
          <button className={`fav-pill ${onlyFav ? 'act' : ''}`} onClick={() => setOnlyFav(!onlyFav)}>★ {t.fav} ({favs.length})</button>
          <div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div>
        </div>
      </div></header>

      <div className="sports-bar"><div className="sports-in">
        {['⚽ Football', '🏀 Basketball', '🏒 Hockey', '🎾 Tennis', '🏏 Cricket'].map(sp => {
          const name = sp.split(' ').slice(1).join(' ');
          return <button key={sp} className={`sport-btn ${sport === name ? 'act' : ''}`} onClick={() => setSport(name)}>{sp}</button>;
        })}
      </div></div>

      <main className="layout">
        <div>
          <div className="filter-card">
            <div className="status-row">
              {[{ id: 'ALL', l: t.all }, { id: 'LV', l: `🔴 ${t.lv}` }, { id: 'UP', l: t.up }, { id: 'FN', l: t.fn }].map(b => (
                <button key={b.id} className={`st-btn ${stFilter === b.id ? 'act' : ''}`} onClick={() => setStFilter(b.id)}>{b.l}</button>
              ))}
            </div>
            <div className="comp-row">
              <button className={`comp-btn ${lg === 'ALL' ? 'act' : ''}`} onClick={() => setLg('ALL')}>🌍 {t.all}</button>
              {comps.map((c: any) => (
                <button key={c.code} className={`comp-btn ${lg === c.code ? 'act' : ''}`} onClick={() => { setLg(c.code); setSideLg(c.code); }}>
                  {c.emblem && <img src={c.emblem} alt="" width={15} height={15} />} {c.name}
                </button>
              ))}
            </div>
          </div>

          {sport !== 'Football' ? (
            <div className="sidebar-box" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <h3>{sport} Live Scores</h3><p style={{ marginTop: 8 }}>Coming soon on Kigali Update Score!</p>
            </div>
          ) : list.length === 0 ? (
            <div className="sidebar-box" style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>No matches found.</div>
          ) : list.map(m => {
            const live = ['IN_PLAY', 'PAUSED'].includes(m.status), fin = m.status === 'FINISHED';
            const timeTxt = live ? `${m.minute || 'LIVE'}'` : fin ? 'FT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={m.id} className={`match-card ${live ? 'is-live' : ''}`} onClick={() => openMatch(m)}>
                <div className="m-meta"><span>{m.competition?.name}</span><span>{new Date(m.utcDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div>
                <div className="m-grid">
                  <span className={`m-time ${live ? 'live' : ''}`}>{timeTxt}</span>
                  <div className="m-team home"><span>{m.homeTeam.shortName || m.homeTeam.name}</span>{m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" />}</div>
                  <div className={`m-score ${live ? 'live' : ''}`}>{m.score.fullTime.home ?? '-'} - {m.score.fullTime.away ?? '-'}</div>
                  <div className="m-team">{m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" />}<span>{m.awayTeam.shortName || m.awayTeam.name}</span></div>
                  <button className={`star-btn ${favs.includes(m.id) ? 'fav' : ''}`} onClick={e => toggleFav(e, m.id)}>{favs.includes(m.id) ? '★' : '☆'}</button>
                </div>
              </div>
            );
          })}
        </div>

        <aside>
          <div className="sidebar-box">
            <input className="search-inp" value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 ${t.s}`} />
            <div className="side-tabs">
              <button className={sideTab === 'TBL' ? 'act' : ''} onClick={() => setSideTab('TBL')}>🏆 {t.tbl}</button>
              <button className={sideTab === 'SCR' ? 'act' : ''} onClick={() => setSideTab('SCR')}>⚽ {t.scr}</button>
            </div>
            <select value={sideLg} onChange={e => setSideLg(e.target.value)} style={{ width: '100%', background: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '7px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>
              {comps.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {sideTab === 'TBL' ? (
              <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead>
                <tbody>{sideTbl.slice(0, 12).map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left', fontWeight: 600 }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800, color: '#ff6b00' }}>{r.points}</td></tr>)}</tbody>
              </table>
            ) : (
