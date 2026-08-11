


const fishData=[
 {r:'쓰레기',p:0,c:30,cls:'trash',items:[['🥫','찌그러진 깡통'],['🥾','해적의 장화'],['🛞','낡은 타이어'],['🪥','바다 칫솔']]},
 {r:'흔한 물고기',p:10,c:40,cls:'common',items:[['🐟','은빛 멸치'],['🦑','통통한 오징어'],['🐡','복어'],['🐠','산호돔']]},
 {r:'희귀 물고기',p:50,c:20,cls:'rare',items:[['🐙','별빛 문어'],['🦞','푸른 가재'],['🐟','무지개 고등어'],['🐡','달빛 복어']]},
 {r:'전설의 물고기',p:100,c:10,cls:'legendary',items:[['🦈','심해 상어'],['🐳','고래의 노래'],['🐉','바다의 용'],['🦄','유니콘 피쉬']]}
];
const $=id=>document.getElementById(id);
const el={score:$('score'),coins:$('coins'),level:$('level'),xp:$('xpBar'),xpText:$('xpText'),button:$('fishButton'),status:$('statusLabel'),message:$('catchMessage'),line:$('line'),bobber:$('bobber'),timing:$('timingArea'),needle:$('meterNeedle'),logs:$('logList'),grid:$('collectionGrid'),combo:$('combo'),badge:$('comboBadge'),toast:$('toast')};
let game=JSON.parse(localStorage.getItem('oceanCatchSave'))||{score:0,coins:0,combo:0,found:[],logs:[]},state='idle',needleTimer,biteTimer,soundOn=true;
function save(){localStorage.setItem('oceanCatchSave',JSON.stringify(game))}function level(){return Math.floor(game.score/100)+1}function toast(t){el.toast.textContent=t;el.toast.classList.add('show');setTimeout(()=>el.toast.classList.remove('show'),2200)}
function render(){el.score.textContent=game.score.toLocaleString();el.coins.textContent=game.coins.toLocaleString();el.level.textContent=level();let xp=game.score%100;el.xp.style.width=xp+'%';el.xpText.textContent=`다음 레벨까지 ${100-xp} XP`;el.combo.textContent=game.combo;el.badge.hidden=game.combo<2;el.grid.innerHTML='';fishData.flatMap(x=>x.items).forEach(([emoji,name])=>{let s=document.createElement('span');s.textContent=emoji;s.title=name;if(game.found.includes(name))s.className='found';el.grid.append(s)});el.logs.innerHTML=game.logs.length?'': '<li class="empty-log">첫 번째 낚시를 기다리고 있어요…</li>';game.logs.forEach(x=>{let li=document.createElement('li');li.innerHTML=`<span>${x.emoji} ${x.name}</span><b class="rarity ${x.cls}">${x.r} · +${x.points}</b>`;el.logs.append(li)})}
function pick(){let n=Math.random()*100,total=0;for(const group of fishData){total+=group.c;if(n<total)return group}}
function sound(freq=440,d=.07){if(!soundOn||!window.AudioContext)return;let a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.04,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+d)}
function cast(){if(state==='idle'){state='waiting';el.button.disabled=true;el.button.innerHTML='🌊 기다리는 중…';el.status.textContent='미끼가 물속으로 가라앉고 있습니다…';document.querySelector('.ocean-card').classList.add('casting');sound(310);biteTimer=setTimeout(bite,900+Math.random()*1700)}else if(state==='bite'){resolve(Number(el.needle.dataset.pos))}}
function bite(){
    state='bite';
    document.querySelector('.ocean-card').classList.add('biting');
    el.timing.hidden=false;
    el.button.disabled=false;
    el.button.innerHTML='⚡ 지금 당기기!';
    el.status.textContent='입질이다! 황금 구간을 노려보세요!';
    let start=performance.now();
    function move(now){
        if(state!=='bite')return;
        let p=((now-start)%1250)/1250*100;
        el.needle.style.left=p+'%';
        el.needle.dataset.pos=p;
        needleTimer=requestAnimationFrame(move)
    }
    needleTimer=requestAnimationFrame(move);
    
    // 버그 수정: 3초 뒤 도망가는 타이머에 'window.missTimer'라는 이름표를 붙여 저장합니다.
    window.missTimer = setTimeout(()=>{if(state==='bite')miss()}, 3000);
    
    sound(720,.12);
}
function miss(){state='idle';cancelAnimationFrame(needleTimer);game.combo=0;resetSea();el.status.textContent='앗, 물고기가 도망갔어요!';el.message.textContent='다음엔 더 정확하게 낚아 보세요.';el.button.disabled=false;el.button.innerHTML='🎣 다시 던지기';render();save();sound(180,.15)}
function resolve(p){
    cancelAnimationFrame(needleTimer);
    let perfect=p>=43&&p<=61;
    let good=p>=35&&p<=69;
    if(!good){
        miss();
        return;
    }

    let caught=pick(),
        item=caught.items[Math.floor(Math.random()*caught.items.length)],
        bonus=perfect?Math.min(game.combo*2,30):0,
        earned=caught.p+bonus;

    // 레어 캐치 연출 트리거
    if(caught.cls==='rare'||caught.cls==='legendary'){
        const card=document.querySelector('.ocean-card');
        card.classList.add('rare-flash');
        setTimeout(()=>card.classList.remove('rare-flash'),1000);
        toast(`✨ ${caught.r} 발견!`);
    }

    game.score+=earned;
    game.coins+=Math.max(1,Math.floor(earned/2));
    game.combo++;
    if(!game.found.includes(item[1])){
        game.found.push(item[1]);
        toast(`✨ 새 도감 발견: ${item[1]}!`);
    }
    game.logs.unshift({emoji:item[0],name:item[1],r:caught.r,cls:caught.cls,points:earned});
    game.logs=game.logs.slice(0,12);
    state='idle';
    resetSea();
    el.status.textContent=perfect?'PERFECT CAST! 보너스가 적용됐어요.':'좋은 타이밍이에요!';
    el.message.textContent=`${item[0]} ${item[1]}을(를) 낚았습니다! +${earned}점`;
    el.button.disabled=false;
    el.button.innerHTML='🎣 한 번 더 낚시하기';
    render();
    save();
    sound(perfect?900:580,.16);
}

function resetSea(){
    clearTimeout(biteTimer);
    // 버그 수정: 바다를 초기화할 때, 도망가는 유령 타이머도 확실하게 꺼줍니다!
    clearTimeout(window.missTimer); 
    
    document.querySelector('.ocean-card').classList.remove('casting','biting');
    el.timing.hidden=true;
}
el.button.addEventListener('click',cast);$('resetButton').addEventListener('click',()=>{if(confirm('점수와 도감까지 모두 초기화할까요?')){game={score:0,coins:0,combo:0,found:[],logs:[]};save();render();toast('새로운 항해를 시작합니다!')}});$('soundButton').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'🔊':'🔇'});render();
// --- 실시간 랭킹 시스템 (커스텀 모달 적용 버전) ---
(function() {
    const firebaseConfig = {
        apiKey: "AlzaSyAWawldJPCfQDjgyfkJcgGoPQxzzdDxjZ8",
        authDomain: "ocean-catch-ranking.firebaseapp.com",
        projectId: "ocean-catch-ranking",
        storageBucket: "ocean-catch-ranking.appspot.com",
        messagingSenderId: "63317267112",
        appId: "1:63317267112:web:1beed3f77fdfd1d285289d"
    };

    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    window.loadLeaderboard = function() {
        const listEl = document.getElementById("leaderboardList");
        if (!listEl) return;
        
        const rankHeader = listEl.previousElementSibling;
        if (rankHeader) {
            rankHeader.style.color = "#ffffff";
            rankHeader.style.fontWeight = "bold";
            rankHeader.style.textShadow = "0 2px 4px rgba(0,0,0,0.8)";
        }

        listEl.style.padding = "0";
        listEl.style.listStyle = "none";
        listEl.style.width = "100%";
        listEl.style.maxWidth = "500px";
        listEl.style.margin = "0 auto";

        db.collection("leaderboard")
            .orderBy("score", "desc")
            .limit(10)
            .get()
            .then((snapshot) => {
                listEl.innerHTML = "";
                if (snapshot.empty) {
                    listEl.innerHTML = "<li style='color: #ffffff; font-weight: bold; background: rgba(0, 0, 0, 0.7); padding: 12px 20px; margin: 8px 0; border-radius: 8px; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);'>등록된 랭킹이 없습니다. 첫 주인공이 되어보세요!</li>";
                    return;
                }
                let rank = 1;
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const li = document.createElement("li");
                    li.style.color = "#ffffff";
                    li.style.fontWeight = "bold";
                    li.style.fontSize = "15px";
                    li.style.background = "rgba(15, 30, 50, 0.95)";
                    li.style.padding = "12px 20px";
                    li.style.margin = "8px 0";
                    li.style.borderRadius = "8px";
                    li.style.display = "flex";
                    li.style.justifyContent = "space-between";
                    li.style.alignItems = "center";
                    li.style.width = "100%";
                    li.style.boxSizing = "border-box";
                    li.style.boxShadow = "0 4px 6px rgba(0,0,0,0.4)";

                    let medal = rank + "위";
                    if (rank === 1) medal = "🥇 1위";
                    else if (rank === 2) medal = "🥈 2위";
                    else if (rank === 3) medal = "🥉 3위";

                    li.innerHTML = '<span style="color: #61dafb; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">' + medal + ' &nbsp; ' + data.nickname + '</span> <span style="color: #ffd700; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">' + data.score + '점</span>';
                    listEl.appendChild(li);
                    rank++;
                });
            })
            .catch((err) => {
                console.error("랭킹 로드 실패:", err);
            });
    };

    // 랭킹 등록 버튼 클릭 시 모달 열기
    window.submitScore = function() {
        let currentScore = 0;
        if (typeof game !== "undefined" && typeof game.score === "number") {
            currentScore = game.score;
        } else {
            const scoreEl = document.getElementById("score");
            if (scoreEl) {
                currentScore = parseInt(scoreEl.textContent.replace(/[^0-9]/g, "")) || 0;
            }
        }

        if (currentScore <= 0) {
            alert("점수가 0점입니다! 낚시를 해서 점수를 올린 후 등록해 주세요.");
            return;
        }

        const modal = document.getElementById("nicknameModal");
        const input = document.getElementById("nicknameInput");
        if (modal && input) {
            input.value = "";
            modal.style.display = "flex";
            input.focus();
        }
    };

    // 모달 닫기
    window.closeNicknameModal = function() {
        const modal = document.getElementById("nicknameModal");
        if (modal) modal.style.display = "none";
    };

    // 모달에서 등록 확인 시 데이터베이스 전송
    window.confirmSubmitScore = function() {
        const input = document.getElementById("nicknameInput");
        if (!input) return;

        const nickname = input.value.trim();
        if (nickname.length < 2) {
            alert("닉네임을 2글자 이상 입력해 주세요.");
            input.focus();
            return;
        }

        let currentScore = 0;
        if (typeof game !== "undefined" && typeof game.score === "number") {
            currentScore = game.score;
        } else {
            const scoreEl = document.getElementById("score");
            if (scoreEl) {
                currentScore = parseInt(scoreEl.textContent.replace(/[^0-9]/g, "")) || 0;
            }
        }

        db.collection("leaderboard").add({
            nickname: nickname,
            score: currentScore,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.closeNicknameModal();
            alert("🎉 랭킹 등록 완료!");
            window.loadLeaderboard();
        }).catch((err) => {
            alert("등록 실패: " + err.message);
        });
    };

    window.addEventListener("DOMContentLoaded", window.loadLeaderboard);
})();
// --- 구글 로그인 및 클라우드 세이브 시스템 ---
(function() {
    // 1. 인증 모듈 불러오기
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    // 2. 로그인 버튼 클릭 이벤트
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider).catch(error => {
                console.error("로그인 에러:", error);
                alert("로그인에 실패했습니다.");
            });
        });
    }

    // 3. 로그아웃 버튼 클릭 이벤트
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                alert("안전하게 로그아웃 되었습니다. (임시 로컬 데이터로 전환됩니다)");
                // 로그아웃 시 로컬 데이터 초기화(선택사항) 및 화면 갱신
                game = {score:0, coins:0, combo:0, found:[], logs:[]};
                save();
                render();
            });
        });
    }

    // 4. 로그인 상태 실시간 감지기
    auth.onAuthStateChanged(user => {
        if (user) {
            // 로그인 성공 시 UI 변경
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            userInfo.style.display = 'inline-block';
            userInfo.textContent = `👋 ${user.displayName} 낚시꾼님 환영합니다!`;
            
            toast("구글 계정으로 로그인되었습니다!");
            
            // TODO: (다음 단계) 클라우드에서 유저의 세이브 파일을 불러와서 덮어쓰는 기능 추가 예정
        } else {
            // 로그아웃 상태 시 UI 변경
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            userInfo.style.display = 'none';
        }
    });
})();
