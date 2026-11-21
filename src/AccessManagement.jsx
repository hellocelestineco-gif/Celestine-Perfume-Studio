import {useEffect,useState} from 'react';
import {Ban,Check,MoreHorizontal,ShieldCheck,UserX,X} from 'lucide-react';
import {listAccessProfiles,setUserAccessStatus} from './supabase';

export function accessStatus(profile){
 if(profile.role==='master')return {label:'Master account',tone:'master'};
 if(profile.status==='blocked')return {label:'Blocked',tone:'blocked'};
 if(profile.status==='rejected')return {label:'Rejected',tone:'rejected'};
 if(profile.approved)return {label:'Accepted',tone:'accepted'};
 return {label:'Pending approval',tone:'pending'};
}

export function accessSummary(profiles){
 return profiles.reduce((summary,profile)=>({
  members:summary.members+(profile.role==='master'?0:1),
  master:summary.master+(profile.role==='master'?1:0),
  pending:summary.pending+(profile.role!=='master'&&!profile.approved&&profile.status!=='rejected'&&profile.status!=='blocked'?1:0),
 }),{members:0,master:0,pending:0});
}

export default function AccessManagement(){
 const[profiles,setProfiles]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(''),[openMenu,setOpenMenu]=useState('');
 const refresh=()=>{setLoading(true);setError('');return listAccessProfiles().then(setProfiles).catch(err=>setError(err.message)).finally(()=>setLoading(false))};
 useEffect(()=>{refresh()},[]);
 const change=async(profile,status)=>{
  if(profile.role==='master')return;
  const labels={approved:'Accept',rejected:'Remove access',blocked:'Block'};
  if(!confirm(`${labels[status]} ${profile.email}?`))return;
  setBusy(profile.user_id);setError('');setOpenMenu('');
  try{const updated=await setUserAccessStatus(profile.user_id,status);setProfiles(items=>items.map(item=>item.user_id===profile.user_id?{...item,...updated}:item))}catch(err){setError(err.message)}finally{setBusy('')}
 };
 const summary=accessSummary(profiles);
 return <section className="card access-card"><div className="card-head"><div><p className="eyebrow">MASTER ACCOUNT</p><h2>Workspace access</h2><p className="access-subtitle">Manage who can open your studio.</p></div><span className="access-shield"><ShieldCheck size={22}/></span></div><div className="access-summary" aria-label="Access summary"><div><strong>{summary.members}</strong><span>Members</span></div><div><strong>{summary.pending}</strong><span>Pending</span></div><div><strong>{summary.master}</strong><span>Master</span></div></div>{loading?<p className="access-status">Loading accounts…</p>:profiles.length?<div className="access-list">{profiles.map(profile=>{const state=accessStatus(profile);const menuOpen=openMenu===profile.user_id;return <div className={`access-row access-row-${state.tone}`} key={profile.user_id}><div className="access-identity"><span className="access-avatar" aria-hidden="true">{profile.email?.slice(0,1).toUpperCase()}</span><span><strong>{profile.email}</strong><small>{state.label}</small></span></div>{profile.role==='master'?<span className="access-badge master"><ShieldCheck size={14}/> Master</span>:<div className="access-actions"><span className={`access-badge ${state.tone}`}>{state.label}</span><div className="access-menu"><button type="button" className="access-menu-trigger" aria-label={`Actions for ${profile.email}`} aria-expanded={menuOpen} onClick={()=>setOpenMenu(menuOpen?'':profile.user_id)} disabled={busy===profile.user_id}><MoreHorizontal size={20}/></button>{menuOpen&&<div className="access-menu-popover" role="menu">{profile.approved?<><button type="button" role="menuitem" onClick={()=>change(profile,'blocked')}><Ban size={15}/> Block</button><button type="button" role="menuitem" onClick={()=>change(profile,'rejected')}><UserX size={15}/> Remove access</button></>:profile.status==='pending'?<><button type="button" role="menuitem" onClick={()=>change(profile,'approved')}><Check size={15}/> Accept</button><button type="button" role="menuitem" onClick={()=>change(profile,'rejected')}><X size={15}/> Reject</button></>:<button type="button" role="menuitem" onClick={()=>change(profile,'approved')}><Check size={15}/> Restore access</button>}</div>}</div></div>}</div>})}</div>:<p className="empty">No accounts have requested access yet.</p>}{error&&<p className="warning" role="alert">{error}</p>}</section>
}
