import { useState, useEffect } from 'react';
import './index.css';

type Lang = 'KINY' | 'ENG' | 'FRA';
const TXT: Record<Lang, any> = {
  KINY: { all: 'Yose', lv: 'LIVE', up: 'Izaba', fn: 'Yarangiye', fav: 'Favourites', s: 'Shakisha ikipe, irushanwa...', tbl: 'Urutonde', scr: 'Abatsinze', inf: 'Info', sum: 'Summary', sts: 'Stats', lnp: 'Line-ups', h2h: 'H2H', dev: 'Yakozwe na Janvier Mwiseneza' },
  ENG: { all: 'All', lv: 'LIVE', up: 'Upcoming', fn: 'Finished', fav: 'Favourites', s: 'Search team, competition...', tbl: 'Table', scr: 'Top Scorers', inf: 'Info', sum: 'Summary', sts: 'Stats', lnp: 'Line-ups', h2h: 'H2H', dev: 'Designed by Janvier Mwiseneza' },
  FRA: { all: 'Tous', lv: 'DIRECT', up: 'À Venir', fn: 'Terminés', fav: 'Favoris', s: 'Rechercher équipe, ligue...', tbl: 'Classement', scr: 'Buteurs', inf: 'Infos', sum: 'Résumé', sts: 'Stats', lnp: 'Compos', h2h: 'H2H', dev: 'Conçu par Janvier Mwiseneza' },
};

const fallbackCrest = (name = 'FC') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://w3.org" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#1e293b" stroke="#475569" stroke-width="2"/><text x="24" y="29" font-family="Arial" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">${name.slice(0, 3).toUpperCase()}</text></svg>`)}`;

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [sport, setSport] = useState('Football');
  const [comps, setComps] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('ls_c2') || '[]'); } catch { return []; } });
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('ls_m2') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('ls_f2') || '[]'); } catch { return []; } });
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
      if (Array.isArray(d.competitions)) { setComps(d.competitions); localStorage.setItem('ls_c2', JSON.stringify(d.competitions)); }
    }).catch(() => {});
  }, []);

  const loadMatches = (c = lg) => {
    fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json()).then(d => {
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('ls_m2', JSON.stringify(d.matches)); }
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
    localStorage.setItem('ls_f2', JSON.stringify(next));
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

  const crestOf = (tm: any) => tm?.crest || fallbackCrest(tm?.shortName || tm?.name || 'FC');
  const emblemOf = (cp: any) => cp?.emblem || fallbackCrest(cp?.code || 'LG');

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
                  <img src={emblemOf(c)} alt="" width={16} height={16} style={{ objectFit: 'contain' }} /> {c.name}
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
                <div className="m-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#e5e7eb' }}>
                    <img src={emblemOf(m.competition)} alt="" width={15} height={15} style={{ objectFit: 'contain' }} />
                    {m.competition?.name}
                  </span>
                  <span>{new Date(m.utcDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="m-grid">
                  <span className={`m-time ${live ? 'live' : ''}`}>{timeTxt}</span>
                  <div className="m-team home"><span>{m.homeTeam.shortName || m.homeTeam.name}</span><img src={crestOf(m.homeTeam)} alt="" /></div>
                  <div className={`m-score ${live ? 'live' : ''}`}>{m.score.fullTime.home ?? '-'} - {m.score.fullTime.away ?? '-'}</div>
                  <div className="m-team"><img src={crestOf(m.awayTeam)} alt="" /><span>{m.awayTeam.shortName || m.awayTeam.name}</span></div>
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
