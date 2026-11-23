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
  const [customMatches, setCustomMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_c10') || '[]'); } catch { return []; } });
  const [adBanner, setAdBanner] = useState(() => localStorage.getItem('kus_a10') || '📢 Advertise on Kigali Update Score • Instant Booking via MTN MoMo: 078XXXXXXX');
  const [momoNum, setMomoNum] = useState(() => localStorage.getItem('kus_momo') || '078XXXXXXX');
  const [form, setForm] = useState({ home: 'TTC Muhanga', away: 'G.S Shyogwe', hs: '2', as: '1', comp: 'Schools Championship', venue: 'Shyogwe Pitch', date: new Date().toISOString().slice(0, 16), status: 'FINISHED', min: '90', added: '4', penH: '', penA: '', goalsTxt: "Jean 23' (TTC Muhanga), Patrick 67' (TTC Muhanga), Bosco 41' (G.S Shyogwe)", lnpH: '1. Jean, 2. Eric, 3. Claude, 4. Patrick, 5. Kevin', lnpA: '1. Bosco, 2. Pacifique, 3. Thierry, 4. Olivier, 5. Samuel' });
  const [matches, setMatches] = useState<any[]>([]);
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f10') || '[]'); } catch { return []; } });
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
      utcDate: form.date ? new Date(form.date).toISOString() : new Date().toISOString(), venue: form.venue, lnpH: form.lnpH, lnpA: form.lnpA, goalsTxt: form.goalsTxt,
      homeTeam: { id: Date.now() + 1, name: form.home, shortName: form.home }, awayTeam: { id: Date.now() + 2, name: form.away, shortName: form.away },
      score: { duration: hasPen ? 'PENALTY_SHOOTOUT' : 'REGULAR', fullTime: { home: form.status === 'TIMED' ? null : Number(form.hs), away: form.status === 'TIMED' ? null : Number(form.as) }, penalties: hasPen ? { home: Number(form.penH), away: Number(form.penA) } : null },
    };
    const next = [item, ...customMatches]; setCustomMatches(next); localStorage.setItem('kus_c10', JSON.stringify(next)); alert('✅ Match, Scorers & Line-ups saved!');
  };

  const delCustomMatch = (id: number) => { const next = customMatches.filter(x => x.id !== id); setCustomMatches(next); localStorage.setItem('kus_c10', JSON.stringify(next)); };
  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f10', JSON.stringify(nx)); };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    if (m.competition?.code === 'SCHOOL') return;
    const hm = encodeURIComponent(m.homeTeam?.name || '');
    const dt = encodeURIComponent(m.utcDate || '');
    const [ex, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=extras&id=${m.id}&home=${hm}&date=${dt}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(ex); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
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
