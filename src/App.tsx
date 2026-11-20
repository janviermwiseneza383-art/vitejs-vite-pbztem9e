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
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_v8') || '[]'); } catch { return []; } });
  const [favs, setFavs] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kus_f8') || '[]'); } catch { return []; } });
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
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('kus_v8', JSON.stringify(d.matches)); }
    }).catch(() => {});
  };

  useEffect(() => { load(lg); const i = setInterval(() => load(lg), 30000); return () => clearInterval(i); }, [lg]);
  useEffect(() => {
    fetch(`/api/matches?type=standings&code=${sideLg}`).then(r => r.json()).then(d => setSideTbl((Array.isArray(d?.standings) ? d.standings.at(0)?.table : []) || [])).catch(() => {});
  }, [sideLg]);

  const toggleFav = (e: any, id: number) => {
    e.stopPropagation();
    const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    setFavs(nx); localStorage.setItem('kus_f8', JSON.stringify(nx));
  };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    const [d1, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
  };
