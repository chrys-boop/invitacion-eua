(function(){
  var mt=document.getElementById('marquee-track');
  if(mt) mt.innerHTML += mt.innerHTML;

  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.08});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  function nextTarget(){
    return new Date(2026, 11, 4, 18, 30, 0);
  }

  var target = nextTarget();
  var elD=document.getElementById('cd-d'), elH=document.getElementById('cd-h'),
      elM=document.getElementById('cd-m'), elS=document.getElementById('cd-s'),
      note=document.getElementById('cd-note');

  function pad(n){ return (n<10?'0':'')+n; }
  function tick(){
    var diff = target - new Date();
    if(diff <= 0){
      elD.textContent='0'; elH.textContent='00'; elM.textContent='00'; elS.textContent='00';
      note.textContent='¡Llegó el día! Hoy es la revelación';
      return;
    }
    var d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000),
        m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
    elD.textContent=d; elH.textContent=pad(h); elM.textContent=pad(m); elS.textContent=pad(s);
  }
  tick(); setInterval(tick,1000);

  var canvas=document.getElementById('confetti'), ctx=canvas.getContext('2d'), parts=[], raf=null;
  function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
  resize(); addEventListener('resize', resize);
  var COLORS=['#d93a6e','#f27ba3','#1a86d6','#4db2f0','#ffd166','#ffffff'];
  function burst(x,y,n){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    n=n||90;
    for(var i=0;i<n;i++){
      parts.push({x:x,y:y,vx:(Math.random()-0.5)*11,vy:-Math.random()*10-4,g:0.28,size:Math.random()*7+4,color:COLORS[i%COLORS.length],rot:Math.random()*Math.PI,vr:(Math.random()-0.5)*0.3,life:1});
    }
    if(!raf) loop();
  }
  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts=parts.filter(function(p){return p.life>0 && p.y<canvas.height+30;});
    parts.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.vx*=0.99; p.rot+=p.vr; p.life-=0.006;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=Math.max(p.life,0);
      ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.62); ctx.restore();
    });
    if(parts.length){ raf=requestAnimationFrame(loop); } else { raf=null; ctx.clearRect(0,0,canvas.width,canvas.height); }
  }

  var env=document.getElementById('envelope'), smsg=document.getElementById('secret-msg'), tries=0;
  var secretLines=[
    '¡Casi! Pero el sobre sigue sellado… <strong>la respuesta se guarda hasta el 04 de diciembre de 2026.</strong>',
    'El sobre se ríe de nosotros: <strong>ni con lupita se ve nada.</strong> ¡A esperar el gran momento!',
    'Confirmado: <strong>es un secreto muy bien guardado.</strong> Tu misión es venir, votar y descubrirlo en vivo.'
  ];
  var secretBtn=document.getElementById('btn-secret');
  if(secretBtn) secretBtn.addEventListener('click', function(){
    env.classList.remove('shake'); void env.offsetWidth; env.classList.add('shake');
    smsg.innerHTML=secretLines[Math.min(tries, secretLines.length-1)];
    tries++;
    var r=env.getBoundingClientRect(); burst(r.left+r.width/2, r.top+r.height/2, 35);
  });

  var result=document.getElementById('vote-result');
  var btnNino=document.getElementById('vote-nino'), btnNina=document.getElementById('vote-nina');
  var mBlue=document.getElementById('meter-blue'), mNote=document.getElementById('meter-note');
  function vote(team, btn, other){
    btn.classList.add('selected'); other.classList.remove('selected');
    btn.setAttribute('aria-pressed','true'); other.setAttribute('aria-pressed','false');
    var rect=btn.getBoundingClientRect(); burst(rect.left+rect.width/2, rect.top+rect.height/2);
    if(team==='nino'){
      mBlue.style.width='62%';
      mNote.textContent='Tu voto movió la barra: en esta pantalla manda el Team Niño.';
      result.innerHTML='¡Eres <strong>Team Niño</strong>!<br>No olvides traer <strong>toallitas húmedas</strong>.<br>Confirma tu asistencia al (917) 284-4848 y ven a descubrir si acertaste.';
    } else {
      mBlue.style.width='38%';
      mNote.textContent='Tu voto movió la barra: en esta pantalla manda el Team Niña.';
      result.innerHTML='¡Eres <strong>Team Niña</strong>!<br>No olvides traer <strong>pañales</strong>.<br>Confirma tu asistencia al (917) 284-4848 y ven a descubrir si acertaste.';
    }
    result.classList.add('show');
  }
  if(btnNino) btnNino.addEventListener('click', function(){ vote('nino', btnNino, btnNina); });
  if(btnNina) btnNina.addEventListener('click', function(){ vote('nina', btnNina, btnNino); });

  var musicAudio = new Audio('./sources/Revelacion.mp3');
  musicAudio.loop = true;
  musicAudio.volume = 0.35;
  musicAudio.preload = 'auto';
  var musicPlaying = false;
  var musicBtn = document.getElementById('music-toggle');
  var musicLabel = document.getElementById('music-label');
  var musicLabelTimer = null;

  function updateMusicBtn(){
    if(!musicBtn) return;
    if(musicPlaying){
      musicBtn.classList.remove('is-muted');
      musicBtn.setAttribute('aria-pressed','true');
      musicBtn.setAttribute('aria-label','Pausar la música de fondo');
    } else {
      musicBtn.classList.add('is-muted');
      musicBtn.setAttribute('aria-pressed','false');
      musicBtn.setAttribute('aria-label','Reproducir la música de fondo');
    }
  }

  function showMusicLabel(message){
    if(!musicLabel) return;
    musicLabel.textContent=message;
    musicLabel.classList.add('show');
    if(musicLabelTimer) clearTimeout(musicLabelTimer);
    musicLabelTimer=setTimeout(function(){ musicLabel.classList.remove('show'); },2000);
  }

  function startMusic(){
    musicAudio.play().then(function(){ musicPlaying=true; updateMusicBtn(); }).catch(function(error){
      musicPlaying=false; updateMusicBtn(); console.error('Error al reproducir la música:', error); showMusicLabel('No se pudo iniciar la música');
    });
  }
  function pauseMusic(){
    musicAudio.pause(); musicPlaying=false; updateMusicBtn(); showMusicLabel('Música pausada');
  }

  if(musicBtn){
    musicBtn.addEventListener('click', function(){
      if(musicAudio.paused){ startMusic(); showMusicLabel('Música de fondo'); }
      else pauseMusic();
    });
  }
  musicAudio.addEventListener('play', function(){ musicPlaying=true; updateMusicBtn(); });
  musicAudio.addEventListener('pause', function(){ musicPlaying=false; updateMusicBtn(); });
  musicAudio.addEventListener('error', function(){ musicPlaying=false; updateMusicBtn(); console.error('No se encontró el MP3. Revisa la carpeta sources.'); });
  updateMusicBtn();

  var cover=document.getElementById('cover');
  var btnOpen=document.getElementById('btn-open');
  var coverOpened=false;

  function openInvitation(){
    if(coverOpened) return;
    coverOpened=true;
    startMusic();
    if(cover) cover.classList.add('opened');
    document.body.classList.remove('cover-locked');
    if(musicBtn) musicBtn.classList.add('show');
    showMusicLabel('Música de fondo');
    setTimeout(function(){ burst(innerWidth/2, Math.min(innerHeight*0.32,280)); },320);
    setTimeout(function(){ if(cover) cover.style.display='none'; window.scrollTo(0,0); },780);
  }

  if(btnOpen) btnOpen.addEventListener('click', openInvitation);
  if(cover){
    cover.addEventListener('click', function(ev){ if(ev.target===cover) openInvitation(); });
  }
})();
