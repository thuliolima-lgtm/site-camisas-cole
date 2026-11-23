"use strict";
const TIMES=[
{id:1,team:"Brasil",category:"Seleções",colors:["#f5d928","#168c45"],pattern:"plain"},{id:2,team:"Argentina",category:"Seleções",colors:["#75c5e8","#fff"],pattern:"stripes"},{id:3,team:"Alemanha",category:"Seleções",colors:["#171717","#e4d8bc"],pattern:"plain"},{id:4,team:"França",category:"Seleções",colors:["#172e70","#fff"],pattern:"stripes"},{id:5,team:"Portugal",category:"Seleções",colors:["#c51d2c","#188447"],pattern:"band"},{id:6,team:"Espanha",category:"Seleções",colors:["#c51d2c","#f5cf35"],pattern:"band"},
{id:7,team:"Flamengo",category:"Clubes",colors:["#d71920","#111"],pattern:"stripes"},{id:8,team:"Corinthians",category:"Clubes",colors:["#eee","#161616"],pattern:"plain"},{id:9,team:"Palmeiras",category:"Clubes",colors:["#087b46","#f2f2f2"],pattern:"plain"},{id:10,team:"Santos",category:"Clubes",colors:["#f4f4f4","#161616"],pattern:"plain"},{id:11,team:"São Paulo",category:"Clubes",colors:["#eee","#d71920"],pattern:"band"},{id:12,team:"Barcelona",category:"Clubes",colors:["#172b75","#b51d3b"],pattern:"stripes"},{id:13,team:"Real Madrid",category:"Clubes",colors:["#f5f3ed","#b9a36a"],pattern:"plain"},{id:14,team:"Manchester City",category:"Clubes",colors:["#79c9e8","#fff"],pattern:"plain"},{id:15,team:"Liverpool",category:"Clubes",colors:["#c8102e","#f2f2f2"],pattern:"plain"},{id:16,team:"Boca Juniors",category:"Clubes",colors:["#102c68","#f4cf35"],pattern:"band"},{id:17,team:"Milan",category:"Clubes",colors:["#c51d2c","#111"],pattern:"stripes"},{id:18,team:"PSG",category:"Clubes",colors:["#172b55","#e83b5b"],pattern:"band"},{id:19,team:"Ajax",category:"Clubes",colors:["#e6e6e6","#d71920"],pattern:"band"},{id:20,team:"Bayern de Munique",category:"Clubes",colors:["#d71920","#fff"],pattern:"stripes"}];
const RARIDADES=[{nome:"Comum",min:0,max:39,chance:55,valorMin:35,valorMax:110,classe:"common"},{nome:"Rara",min:40,max:64,chance:25,valorMin:120,valorMax:350,classe:"rare"},{nome:"Épica",min:65,max:84,chance:14,valorMin:400,valorMax:950,classe:"epic"},{nome:"Lendária",min:85,max:96,chance:5,valorMin:1100,valorMax:3500,classe:"legendary"},{nome:"Mítica",min:97,max:100,chance:1,valorMin:5000,valorMax:18000,classe:"mythic"}];
const $=id=>document.getElementById(id),SAVE_KEY="camisaRara_v2";
function carregar(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return{coins:500,inventory:[],totalOpens:0};const d=JSON.parse(raw);if(!d||!Array.isArray(d.inventory)||!Number.isFinite(d.coins))throw Error("Save inválido");return{coins:d.coins,inventory:d.inventory,totalOpens:d.totalOpens||0}}catch(e){console.warn("Save não pôde ser lido:",e);return{coins:500,inventory:[],totalOpens:0}}}
let jogo=carregar();
jogo.profile = jogo.profile || {name:"Thulio", avatar:"T", color:"green"};
jogo.lastDailyClaim = Number(jogo.lastDailyClaim || 0);
function salvar(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(jogo))}catch(e){console.error(e);toast("Não foi possível salvar o progresso.")}}
function dinheiro(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0})}
function media(){return jogo.inventory.length?jogo.inventory.reduce((s,c)=>s+c.rarity,0)/jogo.inventory.length:0}
function valorTotal(){return jogo.inventory.reduce((s,c)=>s+c.value,0)}
function melhor(){return jogo.inventory.reduce((m,c)=>!m||c.rarity>m.rarity?c:m,null)}
function raridade(p){return RARIDADES.find(r=>p>=r.min&&p<=r.max)||RARIDADES[0]}
function nivel(){return Math.floor(jogo.totalOpens/5)+1}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2600)}

function atualizarPerfilVisual(){
 const p=jogo.profile||{name:"Colecionador",avatar:"C",color:"green"};
 const nome=p.name||"Colecionador",avatar=(p.avatar||nome.slice(0,1)||"C").toUpperCase().slice(0,2);
 const mini=$("profileShortcut"),large=$("profileAvatarLarge");
 if(mini){mini.textContent=avatar;mini.className=`user-avatar profile-shortcut ${p.color||"green"}`;}
 if(large){large.textContent=avatar;large.className=`profile-avatar-large ${p.color||"green"}`;}
 if($("profileNamePreview"))$("profileNamePreview").textContent=nome;
 if($("profileLevelPreview"))$("profileLevelPreview").textContent=`Nível ${String(nivel()).padStart(2,"0")} · ${nivel()>5?"Veterano":"Colecionador"}`;
 if($("profileShirtCount"))$("profileShirtCount").textContent=jogo.inventory.length;
 if($("profilePackCount"))$("profilePackCount").textContent=jogo.totalOpens;
 if($("profileNameInput") && document.activeElement!==$("profileNameInput"))$("profileNameInput").value=nome;
 if($("profileAvatarInput") && document.activeElement!==$("profileAvatarInput"))$("profileAvatarInput").value=avatar;
 if($("profileColor"))$("profileColor").value=p.color||"green";
}
function salvarPerfil(){
 const nome=$("profileNameInput").value.trim().slice(0,22);
 const avatar=$("profileAvatarInput").value.trim().slice(0,2).toUpperCase() || nome.slice(0,1).toUpperCase() || "C";
 const color=$("profileColor").value;
 if(!nome){toast("Digite um nome para seu perfil.");return;}
 jogo.profile={name:nome,avatar,color};salvar();atualizarPerfilVisual();toast("Perfil atualizado com sucesso!");
}
function atualizarRecompensaDiaria(){
 const btn=$("claimDaily"),status=$("dailyStatus");if(!btn||!status)return;
 const restante=24*60*60*1000-(Date.now()-jogo.lastDailyClaim);
 if(restante<=0){btn.disabled=false;btn.textContent="RESGATAR CAMISA GRÁTIS ↗";status.textContent="Disponível agora";}
 else{btn.disabled=true;btn.textContent="RECOMPENSA RESGATADA";const h=Math.floor(restante/3600000),m=Math.floor((restante%3600000)/60000);status.textContent=`Próxima camisa grátis em ${h}h ${m}min`;}
}
function resgatarCamisaDiaria(){
 const restante=24*60*60*1000-(Date.now()-jogo.lastDailyClaim);
 if(restante>0){atualizarRecompensaDiaria();toast("Sua recompensa diária ainda está no tempo de espera.");return;}
 const c=gerarCamisa();jogo.inventory.push(c);jogo.lastDailyClaim=Date.now();jogo.totalOpens++;
 salvar();atualizarTudo();atualizarRecompensaDiaria();
 const r=raridade(c.rarity);
 $("packResult").innerHTML=`<div class="result-card"><span class="eyebrow">PRESENTE DIÁRIO RESGATADO</span><div class="shirt-art">${desenho(c)}</div><span class="rarity ${r.classe}">${r.nome}</span><h2>${c.team}</h2><p>${c.category} · Raridade ${c.rarity}/100</p><div class="result-price">${dinheiro(c.value)}</div><p>Você recebeu esta camisa gratuitamente. Nenhuma moeda foi descontada!</p><div class="result-actions"><button class="secondary-button" id="goCollectionDaily">VER COLEÇÃO</button></div></div>`;
 $("goCollectionDaily").addEventListener("click",()=>navegar("colecao"));
 toast(`${c.team} recebida gratuitamente!`);
}

function navegar(id){if(!$(id))return;document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.querySelectorAll("[data-navigation]").forEach(b=>b.classList.toggle("active",b.dataset.navigation===id));$(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});atualizarTudo()}
document.querySelectorAll("[data-navigation]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();navegar(b.dataset.navigation)}));
function desenho(c){const uid="g"+Math.random().toString(36).slice(2,10);let extra=c.pattern==="stripes"?`<path d="M48 18h14v92H48zM78 18h14v92H78z" fill="${c.colors[1]}"/>`:c.pattern==="band"?`<path d="M25 55h90v23H25z" fill="${c.colors[1]}"/>`:"";return `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Camisa ${c.team}"><defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.colors[0]}"/><stop offset="1" stop-color="${c.colors[0]}" stop-opacity=".76"/></linearGradient></defs><path d="M43 13 20 24 4 58l20 11 10-17v83h72V52l10 17 20-11-16-34-23-11-13 13H56z" fill="url(#${uid})" stroke="#ffffff55" stroke-width="2"/>${extra}<path d="M53 13q17 17 34 0" fill="none" stroke="${c.colors[1]}" stroke-width="6"/><path d="M59 30h22v16H59z" fill="${c.colors[1]}" opacity=".85"/><text x="70" y="96" text-anchor="middle" font-size="22" font-weight="900" fill="${c.colors[1]}" font-family="Arial">10</text></svg>`}
function dadosCatalogo(t,i){const r=RARIDADES[i%5];return{...t,rarity:Math.floor((r.min+r.max)/2),value:Math.round((r.valorMin+r.valorMax)/2),tier:r.nome}}
function renderCatalogo(){const grid=$("catalogGrid"),q=$("searchCatalog").value.trim().toLocaleLowerCase("pt-BR"),f=$("filterCatalog").value,o=$("sortCatalog").value;let arr=TIMES.map(dadosCatalogo).filter(c=>c.team.toLocaleLowerCase("pt-BR").includes(q)&&(f==="todos"||c.category===f));if(o==="raridade")arr.sort((a,b)=>b.rarity-a.rarity);if(o==="valor")arr.sort((a,b)=>b.value-a.value);if(o==="nome")arr.sort((a,b)=>a.team.localeCompare(b.team,"pt-BR"));$("catalogCount").textContent=`${arr.length} uniformes encontrados`;grid.innerHTML=arr.length?arr.map(c=>{const n=jogo.inventory.filter(x=>x.team===c.team).length,r=raridade(c.rarity);return `<article class="shirt-card">${n?`<span class="shirt-quantity">✓ ${n}x</span>`:""}<div class="shirt-art">${desenho(c)}</div><div class="shirt-info"><span class="rarity ${r.classe}">${r.nome}</span><h3>${c.team}</h3><p>${c.category}</p><div class="shirt-data"><span>Raridade de referência</span><strong>${c.rarity}/100</strong></div></div></article>`}).join(""):`<div class="empty-state"><strong>NENHUM UNIFORME ENCONTRADO</strong>Tente outra pesquisa.</div>`}
function renderColecao(){const grid=$("collectionGrid"),q=$("searchCollection").value.trim().toLocaleLowerCase("pt-BR"),f=$("filterCollection").value,o=$("sortCollection").value;let arr=jogo.inventory.filter(c=>c.team.toLocaleLowerCase("pt-BR").includes(q)&&(f==="todos"||c.tier===f));if(o==="raridade")arr.sort((a,b)=>b.rarity-a.rarity);if(o==="valor")arr.sort((a,b)=>b.value-a.value);if(o==="recentes")arr.sort((a,b)=>b.id-a.id);$("collectionCount").textContent=jogo.inventory.length;$("collectionValue").textContent=dinheiro(valorTotal());$("collectionAverage").textContent=`${media().toFixed(1)}/100`;grid.innerHTML=arr.length?arr.map(c=>{const r=raridade(c.rarity);return `<article class="shirt-card ${c.tier==="Mítica"?"mythic-card":c.tier==="Lendária"?"legendary-card":""}"><div class="shirt-art">${desenho(c)}</div><div class="shirt-info"><span class="rarity ${r.classe}">${r.nome}</span><h3>${c.team}</h3><p>${c.category}</p><div class="shirt-data"><span>Raridade</span><strong>${c.rarity}/100</strong></div><div class="shirt-data"><span>Valor estimado</span><strong>${dinheiro(c.value)}</strong></div><button class="sell-button" data-sell="${c.id}">VENDER CAMISA · <strong>${dinheiro(Math.max(10,Math.floor(c.value*0.7)))}</strong></button></div></article>`}).join(""):`<div class="empty-state"><strong>SUA COLEÇÃO ESTÁ VAZIA</strong>Abra um pacote e encontre seu primeiro uniforme!</div>`}

function venderCamisa(id){
 const index=jogo.inventory.findIndex(c=>String(c.id)===String(id));
 if(index<0){toast("Esta camisa não foi encontrada.");return;}
 const c=jogo.inventory[index],preco=Math.max(10,Math.floor(c.value*0.7));
 if(!confirm(`Vender ${c.team} por ${dinheiro(preco)} em moedas? Esta ação não pode ser desfeita.`))return;
 jogo.inventory.splice(index,1);jogo.coins+=preco;salvar();atualizarTudo();
 toast(`${c.team} vendida! +${preco} moedas.`);
}

function renderStats(){const n=jogo.inventory.length,m=media(),b=melhor();$("statCount").textContent=n;$("statAverage").textContent=`${m.toFixed(1)}/100`;$("statValue").textContent=dinheiro(valorTotal());$("statBest").textContent=b?`${b.rarity}/100`:"0/100";$("statBestName").textContent=b?b.team:"Nenhuma peça";$("totalOpens").textContent=jogo.totalOpens;const xp=jogo.totalOpens%5,p=xp/5*100;$("playerLevel").textContent=String(nivel()).padStart(2,"0");$("playerXP").textContent=`${xp}/5 PACOTES`;$("levelProgress").style.width=p+"%";$("levelDescription").textContent=`${xp} de 5 pacotes para alcançar o próximo nível.`;$("rarityStats").innerHTML=RARIDADES.map(r=>{const count=jogo.inventory.filter(c=>c.tier===r.nome).length,pc=n?count/n*100:0;return `<div class="rarity-row"><div class="rarity-label"><span class="rarity ${r.classe}">${r.nome}</span><strong>${count} (${pc.toFixed(1)}%)</strong></div><div class="progress-track"><div style="width:${pc}%"></div></div></div>`}).join("")}
function renderInicio(){$("homeCount").textContent=jogo.inventory.length;$("homeAverage").textContent=`${media().toFixed(1)}/100`;$("homeValue").textContent=dinheiro(valorTotal());const b=melhor();$("homeBest").textContent=b?`${b.rarity}/100`:"0/100";const recent=[...jogo.inventory].sort((a,b)=>b.id-a.id).slice(0,4);$("recentGrid").innerHTML=recent.length?recent.map(c=>{const r=raridade(c.rarity);return `<article class="shirt-card"><div class="shirt-art">${desenho(c)}</div><div class="shirt-info"><span class="rarity ${r.classe}">${r.nome}</span><h3>${c.team}</h3><div class="shirt-data"><span>Raridade</span><strong>${c.rarity}/100</strong></div></div></article>`}).join(""):`<div class="empty-state"><strong>SUA PRIMEIRA CAMISA ESTÁ ESPERANDO!</strong>Abra seu primeiro pacote para começar a coleção.</div>`;$("coins").textContent=jogo.coins.toLocaleString("pt-BR")}
function sortear(){let n=Math.random()*100,s=0;for(const r of RARIDADES){s+=r.chance;if(n<s)return r}return RARIDADES[0]}
function gerarCamisa(){const t=TIMES[Math.floor(Math.random()*TIMES.length)],r=sortear(),p=Math.floor(Math.random()*(r.max-r.min+1))+r.min,v=Math.round((r.valorMin+Math.random()*(r.valorMax-r.valorMin))/5)*5;return{...t,id:Date.now()+Math.random(),rarity:p,value:v,tier:r.nome,acquiredAt:new Date().toISOString()}}
let abrindo=false;function abrirPacote(){if(abrindo)return;if(jogo.coins<100){toast("Você não possui moedas suficientes!");return}abrindo=true;const btn=$("openPack"),pack=$("packArt"),result=$("packResult");btn.disabled=true;btn.textContent="ABRINDO PACOTE...";pack.style.transform="scale(1.12) rotate(8deg)";pack.style.filter="brightness(1.5)";result.innerHTML=`<div class="result-card"><h2>REVELANDO SUA PRÓXIMA DESCOBERTA...</h2><p>A sorte está sendo lançada.</p></div>`;setTimeout(()=>{jogo.coins-=100;const c=gerarCamisa();jogo.inventory.push(c);jogo.totalOpens++;const bonus=jogo.totalOpens%3===0;if(bonus)jogo.coins+=100;const r=raridade(c.rarity);result.innerHTML=`<div class="result-card"><span class="eyebrow">${bonus?"BÔNUS DE COLECIONADOR!":"NOVA DESCOBERTA"}</span><div class="shirt-art">${desenho(c)}</div><span class="rarity ${r.classe}">${r.nome}</span><h2>${c.team}</h2><p>${c.category} · Raridade ${c.rarity}/100</p><div class="result-price">${dinheiro(c.value)}</div>${bonus?"<p>Você ganhou 100 moedas de bônus!</p>":""}<div class="result-actions"><button class="secondary-button" id="goCollection">VER COLEÇÃO</button></div></div>`;pack.style.transform="";pack.style.filter="";abrindo=false;$("goCollection").addEventListener("click",()=>navegar("colecao"));salvar();atualizarTudo();atualizarRecompensaDiaria();toast(`${c.team} adicionada à sua coleção!`)},1100)}
function atualizarTudo(){renderInicio();renderCatalogo();renderColecao();renderStats();atualizarPerfilVisual();$("coins").textContent=jogo.coins.toLocaleString("pt-BR");$("openPack").disabled=jogo.coins<100;}
["searchCatalog","filterCatalog","sortCatalog"].forEach(id=>$(id).addEventListener(id.startsWith("search")?"input":"change",renderCatalogo));["searchCollection","filterCollection","sortCollection"].forEach(id=>$(id).addEventListener(id.startsWith("search")?"input":"change",renderColecao));$("openPack").addEventListener("click",abrirPacote);
$("claimDaily").addEventListener("click",resgatarCamisaDiaria);
$("saveProfile").addEventListener("click",salvarPerfil);
$("collectionGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-sell]");if(btn)venderCamisa(btn.dataset.sell);});
$("heroShirt").innerHTML=desenho(TIMES[0]);atualizarTudo();atualizarPerfilVisual();atualizarRecompensaDiaria();console.log("Camisa Rara iniciado com sucesso.");
