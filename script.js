/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 1/6
   게임 기본 설정 + 물고기 데이터베이스
   ========================================================= */


/* =========================================================
   1. FIREBASE 설정
   ========================================================= */

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWawldJPcFQDjgyfkJcgGoPQxzzdDxjZ8",
  authDomain: "ocean-catch-ranking.firebaseapp.com",
  projectId: "ocean-catch-ranking",
  storageBucket: "ocean-catch-ranking.firebasestorage.app",
  messagingSenderId: "63317267112",
  appId: "1:63317267112:web:1beed3f77fdfd1d285289d"
};

// Initialize Firebase

let auth = null;
let db = null;

try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
    db = firebase.firestore();
  }
} catch (error) {
  console.error("Firebase 초기화 실패:", error);
}


/* =========================================================
   2. 공통 유틸리티
   ========================================================= */

const $ = (id) => document.getElementById(id);

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const randomBetween = (min, max) => {
  return min + Math.random() * (max - min);
};

const randomInt = (min, max) => {
  return Math.floor(
    randomBetween(min, max + 1)
  );
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("ko-KR");
};

function weightedRandom(array, weightKey = "probability") {
  if (!array || array.length === 0) {
    return null;
  }

  const total = array.reduce(
    (sum, item) => {
      return sum + Number(item[weightKey] || 0);
    },
    0
  );

  if (total <= 0) {
    return array[0];
  }

  let roll = Math.random() * total;

  for (const item of array) {
    roll -= Number(item[weightKey] || 0);

    if (roll <= 0) {
      return item;
    }
  }

  return array[array.length - 1];
}


/* =========================================================
   3. 물고기 데이터베이스
   ---------------------------------------------------------
   fishData에 들어가는 정보

   id          : 고유 ID
   name        : 이름
   emoji       : 현재 임시 이미지
   rarity      : 등급 코드
   rarityName  : 화면 표시용 등급명
   stars       : 별 표시
   probability : 출현 확률 가중치
   difficulty  : 낚시 난이도 1~5

   minLength / maxLength : 길이(cm)
   minWeight / maxWeight : 무게(kg)

   baseXp      : 기본 경험치
   baseGold    : 기본 골드

   habitat     : 서식지
   description : 물고기 특징

   hidden      : true면 신화처럼 미발견 상태에서 ??? 처리

   ※ 아직 실제 확률/밸런스는 개발 중인 1차 수치입니다.
   ========================================================= */

const FISH_DATA = [];


/* =========================================================
   4. 쓰레기
   ========================================================= */

FISH_DATA.push(
  {
    id: "trash_can",
    name: "찌그러진 깡통",
    emoji: "🥫",
    rarity: "trash",
    rarityName: "쓰레기",
    stars: "☆☆☆☆☆",
    probability: 13,
    difficulty: 1,
    minLength: 8,
    maxLength: 20,
    minWeight: 0.05,
    maxWeight: 0.35,
    baseXp: 2,
    baseGold: 3,
    habitat: "항구 근처",
    description:
      "파도에 떠밀려 온 낡은 깡통입니다.",
    hidden: false
  },

  {
    id: "trash_boot",
    name: "해적의 장화",
    emoji: "🥾",
    rarity: "trash",
    rarityName: "쓰레기",
    stars: "☆☆☆☆☆",
    probability: 12,
    difficulty: 1,
    minLength: 18,
    maxLength: 35,
    minWeight: 0.2,
    maxWeight: 0.8,
    baseXp: 2,
    baseGold: 4,
    habitat: "얕은 바다",
    description:
      "누군가 잃어버린 듯한 오래된 장화입니다.",
    hidden: false
  },

  {
    id: "trash_tire",
    name: "낡은 타이어",
    emoji: "🛞",
    rarity: "trash",
    rarityName: "쓰레기",
    stars: "☆☆☆☆☆",
    probability: 10,
    difficulty: 1,
    minLength: 38,
    maxLength: 70,
    minWeight: 2,
    maxWeight: 6,
    baseXp: 3,
    baseGold: 5,
    habitat: "항구 근처",
    description:
      "오랫동안 바다를 떠돌던 낡은 타이어입니다.",
    hidden: false
  },

  {
    id: "trash_toothbrush",
    name: "바다 칫솔",
    emoji: "🪥",
    rarity: "trash",
    rarityName: "쓰레기",
    stars: "☆☆☆☆☆",
    probability: 9,
    difficulty: 1,
    minLength: 12,
    maxLength: 22,
    minWeight: 0.03,
    maxWeight: 0.12,
    baseXp: 2,
    baseGold: 3,
    habitat: "해안",
    description:
      "바다를 떠돌다 낚싯줄에 걸려 올라온 칫솔입니다.",
    hidden: false
  },

  {
    id: "trash_bottle",
    name: "유리병",
    emoji: "🫙",
    rarity: "trash",
    rarityName: "쓰레기",
    stars: "☆☆☆☆☆",
    probability: 8,
    difficulty: 1,
    minLength: 15,
    maxLength: 30,
    minWeight: 0.15,
    maxWeight: 0.55,
    baseXp: 2,
    baseGold: 4,
    habitat: "해안",
    description:
      "파도에 닳아 반투명해진 유리병입니다.",
    hidden: false
  }
);


/* =========================================================
   5. 일반 물고기
   ========================================================= */

FISH_DATA.push(
  {
    id: "anchovy",
    name: "은빛 멸치",
    emoji: "🐟",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 8,
    difficulty: 1,
    minLength: 5,
    maxLength: 18,
    minWeight: 0.01,
    maxWeight: 0.22,
    baseXp: 10,
    baseGold: 12,
    habitat: "얕은 바다",
    description:
      "작은 무리를 지어 빠르게 움직이는 물고기입니다.",
    hidden: false
  },

  {
    id: "squid",
    name: "통통한 오징어",
    emoji: "🦑",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 7,
    difficulty: 2,
    minLength: 18,
    maxLength: 45,
    minWeight: 0.15,
    maxWeight: 1.4,
    baseXp: 12,
    baseGold: 16,
    habitat: "중층",
    description:
      "밤이 되면 얕은 바다로 올라오는 통통한 오징어입니다.",
    hidden: false
  },

  {
    id: "puffer",
    name: "복어",
    emoji: "🐡",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 7,
    difficulty: 2,
    minLength: 15,
    maxLength: 38,
    minWeight: 0.15,
    maxWeight: 1.7,
    baseXp: 13,
    baseGold: 18,
    habitat: "암초 지대",
    description:
      "위협을 느끼면 몸을 크게 부풀리는 물고기입니다.",
    hidden: false
  },

  {
    id: "coral_bream",
    name: "산호돔",
    emoji: "🐠",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 6,
    difficulty: 2,
    minLength: 16,
    maxLength: 42,
    minWeight: 0.2,
    maxWeight: 1.8,
    baseXp: 14,
    baseGold: 20,
    habitat: "산호초",
    description:
      "산호 사이를 헤엄치는 알록달록한 물고기입니다.",
    hidden: false
  },

  {
    id: "mackerel",
    name: "고등어",
    emoji: "🐟",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 6,
    difficulty: 2,
    minLength: 24,
    maxLength: 55,
    minWeight: 0.25,
    maxWeight: 2.1,
    baseXp: 16,
    baseGold: 22,
    habitat: "중층",
    description:
      "빠른 속도로 무리를 지어 이동합니다.",
    hidden: false
  },

  {
    id: "sardine",
    name: "정어리",
    emoji: "🐟",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 5,
    difficulty: 2,
    minLength: 12,
    maxLength: 28,
    minWeight: 0.08,
    maxWeight: 0.45,
    baseXp: 12,
    baseGold: 15,
    habitat: "얕은 바다",
    description:
      "은빛 떼를 이루어 바다를 이동합니다.",
    hidden: false
  },

  {
    id: "clownfish",
    name: "광대물고기",
    emoji: "🐠",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 5,
    difficulty: 2,
    minLength: 8,
    maxLength: 20,
    minWeight: 0.03,
    maxWeight: 0.18,
    baseXp: 11,
    baseGold: 15,
    habitat: "산호초",
    description:
      "말미잘 사이를 오가는 작은 열대어입니다.",
    hidden: false
  },

  {
    id: "horse_mackerel",
    name: "전갱이",
    emoji: "🐟",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 4,
    difficulty: 2,
    minLength: 20,
    maxLength: 45,
    minWeight: 0.2,
    maxWeight: 1.5,
    baseXp: 15,
    baseGold: 20,
    habitat: "연안",
    description:
      "낚시꾼들에게 친숙한 빠른 회유어입니다.",
    hidden: false
  },

  {
    id: "yellowtail",
    name: "방어",
    emoji: "🐟",
    rarity: "common",
    rarityName: "일반",
    stars: "★☆☆☆☆",
    probability: 3,
    difficulty: 3,
    minLength: 35,
    maxLength: 85,
    minWeight: 0.8,
    maxWeight: 7.2,
    baseXp: 21,
    baseGold: 32,
    habitat: "외해",
    description:
      "강한 힘으로 낚싯줄을 당기는 대표적인 대형 회유어입니다.",
    hidden: false
  }
);


/* =========================================================
   6. 고급 물고기
   ========================================================= */

FISH_DATA.push(
  {
    id: "sea_bass",
    name: "농어",
    emoji: "🐟",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 4,
    difficulty: 3,
    minLength: 30,
    maxLength: 90,
    minWeight: 0.6,
    maxWeight: 8.5,
    baseXp: 26,
    baseGold: 38,
    habitat: "연안 암초",
    description:
      "얕은 암초와 항구 주변에서 사냥하는 육식어입니다.",
    hidden: false
  },

  {
    id: "red_seabream",
    name: "참돔",
    emoji: "🐟",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 3.7,
    difficulty: 3,
    minLength: 25,
    maxLength: 75,
    minWeight: 0.5,
    maxWeight: 6.5,
    baseXp: 30,
    baseGold: 46,
    habitat: "암초 지대",
    description:
      "붉은빛 비늘이 아름다운 바다의 대표 어종입니다.",
    hidden: false
  },

  {
    id: "moray_eel",
    name: "곰치",
    emoji: "🪱",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 3.4,
    difficulty: 3,
    minLength: 35,
    maxLength: 120,
    minWeight: 0.4,
    maxWeight: 9.2,
    baseXp: 31,
    baseGold: 50,
    habitat: "바위 틈",
    description:
      "바위틈에 숨어 있다가 먹이를 덮치는 포식자입니다.",
    hidden: false
  },

  {
    id: "needlefish",
    name: "청새치치어",
    emoji: "🐟",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 3,
    difficulty: 3,
    minLength: 28,
    maxLength: 80,
    minWeight: 0.4,
    maxWeight: 5.2,
    baseXp: 29,
    baseGold: 45,
    habitat: "외해",
    description:
      "날렵한 몸으로 빠르게 이동하는 어린 회유어입니다.",
    hidden: false
  },

  {
    id: "octopus",
    name: "문어",
    emoji: "🐙",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 2.8,
    difficulty: 3,
    minLength: 20,
    maxLength: 70,
    minWeight: 0.5,
    maxWeight: 7.8,
    baseXp: 34,
    baseGold: 53,
    habitat: "암초 동굴",
    description:
      "똑똑하고 민첩한 연체동물입니다.",
    hidden: false
  },

  {
    id: "bluefin",
    name: "참치",
    emoji: "🐟",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 2.5,
    difficulty: 4,
    minLength: 60,
    maxLength: 180,
    minWeight: 5,
    maxWeight: 70,
    baseXp: 45,
    baseGold: 75,
    habitat: "깊은 외해",
    description:
      "엄청난 속도와 힘을 자랑하는 대형 회유어입니다.",
    hidden: false
  },

  {
    id: "sea_turtle",
    name: "바다거북",
    emoji: "🐢",
    rarity: "uncommon",
    rarityName: "고급",
    stars: "★★☆☆☆",
    probability: 1.9,
    difficulty: 3,
    minLength: 45,
    maxLength: 110,
    minWeight: 8,
    maxWeight: 70,
    baseXp: 40,
    baseGold: 62,
    habitat: "따뜻한 해역",
    description:
      "긴 여행을 하는 느긋한 바다의 여행자입니다.",
    hidden: false
  }
);


/* =========================================================
   7. 여기까지가 STEP 1 - 1/6
   ---------------------------------------------------------
   다음 파트에서 이어질 내용:
   - 희귀 물고기
   - 전설 물고기
   - 신화 물고기
   - 데이터 인덱스
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 2/6
   희귀 / 전설 / 신화 물고기
   ========================================================= */


/* =========================================================
   8. 희귀 물고기
   ========================================================= */

FISH_DATA.push(
  {
    id: "starlight_octopus",
    name: "별빛 문어",
    emoji: "🐙",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 2.2,
    difficulty: 3,
    minLength: 25,
    maxLength: 85,
    minWeight: 0.6,
    maxWeight: 8.5,
    baseXp: 60,
    baseGold: 105,
    habitat: "심해 암초",
    description:
      "푸른 점무늬가 밤하늘의 별처럼 빛나는 문어입니다.",
    hidden: false
  },

  {
    id: "blue_lobster",
    name: "푸른 가재",
    emoji: "🦞",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 2.0,
    difficulty: 4,
    minLength: 18,
    maxLength: 47,
    minWeight: 0.3,
    maxWeight: 2.8,
    baseXp: 65,
    baseGold: 120,
    habitat: "암초 지대",
    description:
      "희귀한 푸른빛을 가진 가재입니다. 바위틈에 숨어 지냅니다.",
    hidden: false
  },

  {
    id: "rainbow_mackerel",
    name: "무지개 고등어",
    emoji: "🐟",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 1.8,
    difficulty: 4,
    minLength: 35,
    maxLength: 75,
    minWeight: 0.8,
    maxWeight: 5.5,
    baseXp: 70,
    baseGold: 132,
    habitat: "빛나는 해역",
    description:
      "비늘이 무지개처럼 반사되는 희귀한 고등어입니다.",
    hidden: false
  },

  {
    id: "moon_puffer",
    name: "달빛 복어",
    emoji: "🐡",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 1.5,
    difficulty: 4,
    minLength: 22,
    maxLength: 55,
    minWeight: 0.4,
    maxWeight: 3.2,
    baseXp: 68,
    baseGold: 125,
    habitat: "달빛 해역",
    description:
      "달빛 아래에서 은은한 푸른빛을 내는 복어입니다.",
    hidden: false
  },

  {
    id: "goldfish",
    name: "황금붕어",
    emoji: "🐠",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 1.2,
    difficulty: 4,
    minLength: 10,
    maxLength: 30,
    minWeight: 0.05,
    maxWeight: 0.4,
    baseXp: 80,
    baseGold: 160,
    habitat: "비밀 정원",
    description:
      "금빛 비늘 때문에 오랫동안 전설처럼 전해져 온 물고기입니다.",
    hidden: false
  },

  {
    id: "glass_fish",
    name: "유리물고기",
    emoji: "🐟",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 1.0,
    difficulty: 4,
    minLength: 14,
    maxLength: 35,
    minWeight: 0.05,
    maxWeight: 0.5,
    baseXp: 78,
    baseGold: 150,
    habitat: "맑은 심해",
    description:
      "몸이 투명해 물속에서 찾기 어려운 신비한 물고기입니다.",
    hidden: false
  },

  {
    id: "lionfish",
    name: "사자물고기",
    emoji: "🐠",
    rarity: "rare",
    rarityName: "희귀",
    stars: "★★★☆☆",
    probability: 0.9,
    difficulty: 4,
    minLength: 20,
    maxLength: 45,
    minWeight: 0.3,
    maxWeight: 2.2,
    baseXp: 82,
    baseGold: 165,
    habitat: "산호초 깊은 곳",
    description:
      "화려한 지느러미와 강렬한 외모를 가진 포식어입니다.",
    hidden: false
  }
);


/* =========================================================
   9. 전설 물고기
   ========================================================= */

FISH_DATA.push(
  {
    id: "deep_shark",
    name: "심해 상어",
    emoji: "🦈",
    rarity: "legendary",
    rarityName: "전설",
    stars: "★★★★☆",
    probability: 0.45,
    difficulty: 5,
    minLength: 120,
    maxLength: 420,
    minWeight: 20,
    maxWeight: 330,
    baseXp: 180,
    baseGold: 520,
    habitat: "심해",
    description:
      "빛조차 닿지 않는 심해를 지배하는 포식자입니다.",
    hidden: false
  },

  {
    id: "whale_song",
    name: "고래의 노래",
    emoji: "🐳",
    rarity: "legendary",
    rarityName: "전설",
    stars: "★★★★☆",
    probability: 0.30,
    difficulty: 5,
    minLength: 180,
    maxLength: 900,
    minWeight: 50,
    maxWeight: 7000,
    baseXp: 240,
    baseGold: 850,
    habitat: "외해",
    description:
      "멀리서도 들릴 만큼 깊고 웅장한 울음소리를 내는 거대한 고래입니다.",
    hidden: false
  },

  {
    id: "sea_dragon",
    name: "바다의 용",
    emoji: "🐉",
    rarity: "legendary",
    rarityName: "전설",
    stars: "★★★★☆",
    probability: 0.20,
    difficulty: 5,
    minLength: 160,
    maxLength: 500,
    minWeight: 30,
    maxWeight: 500,
    baseXp: 280,
    baseGold: 1000,
    habitat: "금단의 심해",
    description:
      "고대 선원들의 이야기 속에서만 등장하는 전설의 생명체입니다.",
    hidden: false
  },

  {
    id: "unicorn_fish",
    name: "유니콘 피쉬",
    emoji: "🦄",
    rarity: "legendary",
    rarityName: "전설",
    stars: "★★★★☆",
    probability: 0.12,
    difficulty: 5,
    minLength: 90,
    maxLength: 250,
    minWeight: 12,
    maxWeight: 140,
    baseXp: 260,
    baseGold: 920,
    habitat: "별빛 바다",
    description:
      "머리에 뿔처럼 솟은 지느러미를 가진 전설의 물고기입니다.",
    hidden: false
  },

  {
    id: "storm_ray",
    name: "폭풍 가오리",
    emoji: "🌊",
    rarity: "legendary",
    rarityName: "전설",
    stars: "★★★★☆",
    probability: 0.08,
    difficulty: 5,
    minLength: 150,
    maxLength: 480,
    minWeight: 40,
    maxWeight: 500,
    baseXp: 300,
    baseGold: 1200,
    habitat: "폭풍 해역",
    description:
      "거대한 폭풍과 함께 나타난다고 전해지는 신비한 가오리입니다.",
    hidden: false
  }
);


/* =========================================================
   10. 신화 물고기
   ---------------------------------------------------------
   처음에는 이름을 공개하지 않습니다.

   실제로 잡으면:
   ??? → 실명 공개
   그리고 도감에 등록됩니다.
   ========================================================= */

FISH_DATA.push(
  {
    id: "kraken",
    name: "심해의 크라켄",
    emoji: "🐙",
    rarity: "mythic",
    rarityName: "신화",
    stars: "★★★★★",
    probability: 0.025,
    difficulty: 5,
    minLength: 500,
    maxLength: 1500,
    minWeight: 300,
    maxWeight: 5000,
    baseXp: 800,
    baseGold: 5000,
    habitat: "미지의 심해",
    description:
      "기록조차 남지 않은 깊은 곳에서 잠든 고대의 괴물입니다.",
    hidden: true
  },

  {
    id: "ocean_king",
    name: "바다의 왕",
    emoji: "👑",
    rarity: "mythic",
    rarityName: "신화",
    stars: "★★★★★",
    probability: 0.015,
    difficulty: 5,
    minLength: 700,
    maxLength: 1800,
    minWeight: 500,
    maxWeight: 9000,
    baseXp: 1200,
    baseGold: 8000,
    habitat: "바다의 끝",
    description:
      "모든 바다 생명체의 전설 속에 등장하는 수수께끼의 존재입니다.",
    hidden: true
  },

  {
    id: "abyssal_dragon",
    name: "심연의 해룡",
    emoji: "🐲",
    rarity: "mythic",
    rarityName: "신화",
    stars: "★★★★★",
    probability: 0.010,
    difficulty: 5,
    minLength: 1000,
    maxLength: 2500,
    minWeight: 800,
    maxWeight: 15000,
    baseXp: 1800,
    baseGold: 12000,
    habitat: "세계의 심연",
    description:
      "아무도 직접 보지 못했지만 오래된 기록에는 분명히 존재한다고 적혀 있습니다.",
    hidden: true
  }
);


/* =========================================================
   11. 물고기 인덱스
   --------------------------------------------------------- */

const FISH_BY_ID = Object.fromEntries(
  FISH_DATA.map((fish) => {
    return [fish.id, fish];
  })
);


/* =========================================================
   12. 전체 물고기 수 확인
   ========================================================= */

console.log(
  `🐟 Ocean Catch 물고기 데이터 로드: ${FISH_DATA.length}종`
);


/* =========================================================
   13. 등급별 물고기 목록
   ========================================================= */

const FISH_BY_RARITY = {
  trash: FISH_DATA.filter(
    (fish) => fish.rarity === "trash"
  ),

  common: FISH_DATA.filter(
    (fish) => fish.rarity === "common"
  ),

  uncommon: FISH_DATA.filter(
    (fish) => fish.rarity === "uncommon"
  ),

  rare: FISH_DATA.filter(
    (fish) => fish.rarity === "rare"
  ),

  legendary: FISH_DATA.filter(
    (fish) => fish.rarity === "legendary"
  ),

  mythic: FISH_DATA.filter(
    (fish) => fish.rarity === "mythic"
  )
};


/* =========================================================
   14. 기본 게임 설정
   ========================================================= */

const GAME_VERSION = 2;

const DEFAULT_GAME = {
  version: GAME_VERSION,

  score: 0,
  coins: 0,
  combo: 0,

  found: [],

  /*
    물고기별 기록

    예:
    fishRecords: {
      blue_lobster: {
        count: 4,
        bestLength: 43.7,
        bestWeight: 2.31
      }
    }
  */
  fishRecords: {},

  logs: [],

  /*
    레벨 보상은 다음 단계에서 실제로 연결합니다.
  */
  levelRewardsClaimed: [],

  /*
    현재 낚싯대
  */
  rod: "starter_rod",

  /*
    현재 보유 미끼
  */
  baits: {
    normal: 9999,
    rare: 0,
    legendary: 0,
    mythic: 0
  }
};


/* =========================================================
   15. 새 게임 데이터 생성
   ========================================================= */

function createFreshGame() {
  return JSON.parse(
    JSON.stringify(DEFAULT_GAME)
  );
}


/* =========================================================
   16. 기존 저장 데이터 보정
   ---------------------------------------------------------
   예전 게임의 저장 데이터도 최대한 살립니다.
   ========================================================= */

function normalizeGame(raw) {
  const source =
    raw && typeof raw === "object"
      ? raw
      : {};

  const game = {
    ...createFreshGame(),
    ...source
  };

  game.found =
    Array.isArray(source.found)
      ? source.found
      : [];

  game.logs =
    Array.isArray(source.logs)
      ? source.logs
      : [];

  game.fishRecords = {
    ...(source.fishRecords || {})
  };

  game.levelRewardsClaimed =
    Array.isArray(
      source.levelRewardsClaimed
    )
      ? source.levelRewardsClaimed
      : [];

  game.baits = {
    ...DEFAULT_GAME.baits,
    ...(source.baits || {})
  };

  /*
    예전 버전에서 found에 "푸른 가재"처럼
    이름이 저장되었을 경우 ID로 변환할 수 있도록 준비합니다.
  */
  game.found = game.found
    .map((value) => {
      if (FISH_BY_ID[value]) {
        return value;
      }

      const foundFish =
        FISH_DATA.find(
          (fish) =>
            fish.name === value
        );

      return foundFish
        ? foundFish.id
        : null;
    })
    .filter(Boolean);

  /*
    중복 발견 제거
  */
  game.found = [
    ...new Set(game.found)
  ];

  return game;
}


/* =========================================================
   17. 저장 데이터 불러오기
   ========================================================= */

function loadGame() {
  try {
    const saved =
      localStorage.getItem(
        "oceanCatchSave"
      );

    if (!saved) {
      return createFreshGame();
    }

    return normalizeGame(
      JSON.parse(saved)
    );
  } catch (error) {
    console.warn(
      "기존 저장 데이터를 읽지 못했습니다.",
      error
    );

    return createFreshGame();
  }
}


/* =========================================================
   18. 현재 게임 상태
   ========================================================= */

let game = loadGame();


/* =========================================================
   19. 게임 실행 상태
   ========================================================= */

let state = "idle";

let needleTimer = null;
let biteTimer = null;
let missTimer = null;

let currentBiteFish = null;
let currentCatch = null;

let soundOn = true;


/* =========================================================
   20. STEP 1 - 2/6 완료
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 3/6
   화면 연결 / 저장 / XP / 콤보 / 크기 / 무게
   ========================================================= */


/* =========================================================
   21. HTML 요소 연결
   ---------------------------------------------------------
   index.html에서 만든 요소들을 JavaScript와 연결합니다.
   ========================================================= */

const el = {

  /* 상단 정보 */
  score: $("score"),
  coins: $("coins"),
  level: $("level"),

  /* XP */
  xpBar: $("xpBar"),
  xpText: $("xpText"),
  xpValue: $("xpValue"),

  /* 낚시 버튼 */
  button: $("fishButton"),
  status: $("statusLabel"),
  message: $("catchMessage"),

  /* 낚싯줄 / 찌 */
  line: $("line"),
  bobber: $("bobber"),

  /* 타이밍 */
  timing: $("timingArea"),
  timingMeter: $("timingMeter"),
  sweetSpot: $("sweetSpot"),
  needle: $("meterNeedle"),
  timingHint: $("timingHint"),

  /* 기록 */
  logs: $("logList"),

  /* 도감 */
  grid: $("collectionGrid"),
  modalGrid: $("collectionModalGrid"),

  discovered: $("discovered"),
  totalSpecies: $("totalSpecies"),

  collectionProgressBar:
    $("collectionProgressBar"),

  modalDiscovered:
    $("modalDiscovered"),

  modalTotalSpecies:
    $("modalTotalSpecies"),

  collectionPercent:
    $("collectionPercent"),

  /* 콤보 */
  combo: $("combo"),
  badge: $("comboBadge"),

  /* 토스트 */
  toast: $("toast"),

  /* 메인 바다 */
  oceanCard: $("oceanCard"),

  /* 캐릭터 / 배 */
  boatScene: $("boatScene"),
  angler: $("angler"),

  /* 낚싯대 / 미끼 */
  rodName: $("rodName"),
  baitName: $("baitName"),

  /* 주변 물고기 */
  ambientFishLayer:
    $("ambientFishLayer"),

  /* 거품 */
  bubbleLayer:
    $("bubbleLayer"),

  /* 캐치 연출 */
  catchCelebration:
    $("catchCelebration"),

  catchRarityLabel:
    $("catchRarityLabel"),

  catchTitle:
    $("catchTitle"),

  catchSpec:
    $("catchSpec"),

  /* 결과 모달 */
  resultRarity:
    $("resultRarity"),

  resultFishIcon:
    $("resultFishIcon"),

  catchResultTitle:
    $("catchResultTitle"),

  resultLength:
    $("resultLength"),

  resultWeight:
    $("resultWeight"),

  resultXp:
    $("resultXp"),

  resultGold:
    $("resultGold"),

  resultMessage:
    $("resultMessage"),

  /* 물고기 상세 */
  fishDetailIcon:
    $("fishDetailIcon"),

  fishDetailRarity:
    $("fishDetailRarity"),

  fishDetailTitle:
    $("fishDetailTitle"),

  fishDetailDescription:
    $("fishDetailDescription"),

  fishDetailHabitat:
    $("fishDetailHabitat"),

  fishDetailDifficulty:
    $("fishDetailDifficulty"),

  fishDetailCount:
    $("fishDetailCount"),

  fishDetailBestLength:
    $("fishDetailBestLength"),

  fishDetailBestWeight:
    $("fishDetailBestWeight"),

  fishDetailId:
    $("fishDetailId"),

  /* 확률표 */
  probabilityTable:
    $("probabilityTable")
};


/* =========================================================
   22. 레벨 계산
   ---------------------------------------------------------
   현재 기본 레벨 구조:

   0~99 XP     → LV.1
   100~199 XP  → LV.2
   200~299 XP  → LV.3
   ...

   다음 단계에서 더 깊은 성장 시스템으로 확장할 수 있습니다.
   ========================================================= */

function getLevelFromScore(
  score = game.score
) {
  return (
    Math.floor(
      Math.max(0, score) / 100
    ) + 1
  );
}


/* =========================================================
   23. 현재 레벨 XP
   ========================================================= */

function getXpInCurrentLevel(
  score = game.score
) {
  return (
    Math.max(0, score) % 100
  );
}


/* =========================================================
   24. 레벨당 필요 XP
   ========================================================= */

function getXpRequirement() {
  return 100;
}


/* =========================================================
   25. 저장 기능
   ---------------------------------------------------------
   로컬 저장 + 로그인 상태라면 Firebase 저장
   ========================================================= */

let saveTimer = null;

function save() {

  /*
    너무 자주 Firebase를 호출하지 않도록
    짧은 지연 후 저장합니다.
  */

  clearTimeout(saveTimer);

  saveTimer = setTimeout(
    async () => {

      /* -------------------------
         로컬 저장
         ------------------------- */

      try {

        localStorage.setItem(
          "oceanCatchSave",
          JSON.stringify(game)
        );

      } catch (error) {

        console.error(
          "로컬 저장 실패:",
          error
        );
      }


      /* -------------------------
         Firebase 저장
         ------------------------- */

      try {

        const user =
          auth?.currentUser;

        if (user && db) {

          await db
            .collection("users")
            .doc(user.uid)
            .set(
              game,
              {
                merge: true
              }
            );
        }

      } catch (error) {

        console.warn(
          "클라우드 저장 실패:",
          error
        );

      }

    },
    150
  );
}


/* =========================================================
   26. 토스트 알림
   ========================================================= */

let toastTimer = null;

function toast(message) {

  if (!el.toast) {
    return;
  }

  el.toast.textContent =
    message;

  el.toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer = setTimeout(
    () => {

      el.toast.classList.remove(
        "show"
      );

    },
    2200
  );
}


/* =========================================================
   27. 발견 물고기 검사
   ========================================================= */

function isFound(fishId) {

  return game.found.includes(
    fishId
  );

}


/* =========================================================
   28. 물고기 도감 등록
   ---------------------------------------------------------
   이미 발견한 물고기면 false
   새로 발견하면 true
   ========================================================= */

function markFound(fish) {

  if (!fish) {
    return false;
  }

  if (
    game.found.includes(
      fish.id
    )
  ) {
    return false;
  }

  game.found.push(
    fish.id
  );

  return true;
}


/* =========================================================
   29. 발견한 물고기 수
   ---------------------------------------------------------
   존재하지 않는 잘못된 ID를 무시합니다.

   이 방식이 기존의
   "그림은 다 찼는데 0/16"
   문제를 방지하는 핵심입니다.
   ========================================================= */

function getDiscoveredCount() {

  return game.found.filter(
    (fishId) => {
      return Boolean(
        FISH_BY_ID[fishId]
      );
    }
  ).length;

}


/* =========================================================
   30. 물고기 기록
   ---------------------------------------------------------
   각 물고기마다:

   발견 횟수
   최고 길이
   최고 무게

   를 따로 저장합니다.
   ========================================================= */

function getFishRecord(
  fishId
) {

  if (
    !game.fishRecords[
      fishId
    ]
  ) {

    game.fishRecords[
      fishId
    ] = {

      count: 0,

      bestLength: 0,

      bestWeight: 0

    };

  }

  return game.fishRecords[
    fishId
  ];
}


/* =========================================================
   31. 물고기 기록 업데이트
   ========================================================= */

function updateFishRecord(
  fish,
  catchData
) {

  if (
    !fish ||
    !catchData
  ) {
    return;
  }

  const record =
    getFishRecord(
      fish.id
    );


  /* 발견 횟수 */

  record.count += 1;


  /* 최고 길이 */

  record.bestLength =
    Math.max(
      record.bestLength,
      catchData.length
    );


  /* 최고 무게 */

  record.bestWeight =
    Math.max(
      record.bestWeight,
      catchData.weight
    );

}


/* =========================================================
   32. 물고기 길이 / 무게 생성
   ---------------------------------------------------------
   매번 같은 물고기를 잡아도
   크기와 무게가 달라집니다.

   두 개의 랜덤값 평균을 이용해서
   극단적인 값이 너무 자주 나오지 않도록 합니다.
   ========================================================= */

function generateFishCatch(
  fish
) {

  if (!fish) {
    return {
      length: 0,
      weight: 0
    };
  }


  const lengthRandom =
    (
      Math.random() +
      Math.random()
    ) / 2;


  const weightRandom =
    (
      Math.random() +
      Math.random()
    ) / 2;


  const length =
    fish.minLength +
    (
      fish.maxLength -
      fish.minLength
    ) *
      lengthRandom;


  const weight =
    fish.minWeight +
    (
      fish.maxWeight -
      fish.minWeight
    ) *
      weightRandom;


  return {

    length:
      Number(
        length.toFixed(1)
      ),

    weight:
      Number(
        weight.toFixed(2)
      )

  };

}


/* =========================================================
   33. 콤보 XP 배율
   ---------------------------------------------------------
   기존 게임 문제:

   Math.min(game.combo * 2, 30)

   때문에 일정 콤보 이상에서
   경험치 증가가 멈췄습니다.

   이번에는 로그 형태의 완만한 증가로 변경합니다.

   콤보가 높아질수록 계속 증가하지만
   폭발적으로 커지지는 않습니다.
   ========================================================= */

function getComboMultiplier(
  combo
) {

  const safeCombo =
    Math.max(
      0,
      combo
    );

  return (
    1 +
    Math.log10(
      safeCombo + 1
    ) *
      0.8
  );

}


/* =========================================================
   34. 물고기 크기 보너스
   ========================================================= */

function getSizeMultiplier(
  fish,
  length
) {

  if (!fish) {
    return 1;
  }


  const range =
    fish.maxLength -
    fish.minLength;


  if (range <= 0) {
    return 1;
  }


  const ratio =
    (
      length -
      fish.minLength
    ) / range;


  return (
    0.85 +
    clamp(
      ratio,
      0,
      1
    ) *
      0.55
  );

}


/* =========================================================
   35. 물고기 무게 보너스
   ========================================================= */

function getWeightMultiplier(
  fish,
  weight
) {

  if (!fish) {
    return 1;
  }


  const range =
    fish.maxWeight -
    fish.minWeight;


  if (range <= 0) {
    return 1;
  }


  const ratio =
    (
      weight -
      fish.minWeight
    ) / range;


  return (
    0.9 +
    clamp(
      ratio,
      0,
      1
    ) *
      0.6
  );

}


/* =========================================================
   36. XP / GOLD 계산
   ========================================================= */

function calculateRewards(
  fish,
  catchData,
  perfect
) {

  if (
    !fish ||
    !catchData
  ) {

    return {
      xp: 0,
      gold: 0
    };

  }


  const comboMultiplier =
    getComboMultiplier(
      game.combo
    );


  const sizeMultiplier =
    getSizeMultiplier(
      fish,
      catchData.length
    );


  const weightMultiplier =
    getWeightMultiplier(
      fish,
      catchData.weight
    );


  /*
    PERFECT 성공 시
    XP 20% 증가
  */

  const perfectMultiplier =
    perfect
      ? 1.2
      : 1;


  const xp =
    Math.max(
      1,

      Math.round(
        fish.baseXp *
        comboMultiplier *
        sizeMultiplier *
        perfectMultiplier
      )
    );


  /*
    GOLD도 길이와 무게에 영향을 받습니다.
  */

  const gold =
    Math.max(
      1,

      Math.round(
        fish.baseGold *
        sizeMultiplier *
        weightMultiplier *
        (
          1 +
          Math.min(
            game.combo,
            50
          ) *
            0.015
        ) *
        (
          perfect
            ? 1.15
            : 1
        )
      )
    );


  return {

    xp,

    gold,

    comboMultiplier,

    sizeMultiplier,

    weightMultiplier

  };

}


/* =========================================================
   37. 랜덤 물고기 선택
   ========================================================= */

function pickFish() {

  return weightedRandom(
    FISH_DATA,
    "probability"
  );

}


/* =========================================================
   38. 희귀도 표시
   ========================================================= */

function getRarityLabel(
  fish
) {

  if (!fish) {
    return "";
  }

  return (
    `${fish.stars} ` +
    `${fish.rarityName}`
  );

}


/* =========================================================
   39. 확률표용 등급 그룹 계산
   ========================================================= */

function getRarityProbability() {

  const result = {};

  let totalWeight = 0;


  FISH_DATA.forEach(
    (fish) => {

      totalWeight +=
        Number(
          fish.probability
        ) || 0;

      if (
        !result[
          fish.rarity
        ]
      ) {

        result[
          fish.rarity
        ] = {

          rarity:
            fish.rarity,

          rarityName:
            fish.rarityName,

          weight: 0,

          count: 0

        };

      }


      result[
        fish.rarity
      ].weight +=
        Number(
          fish.probability
        ) || 0;


      result[
        fish.rarity
      ].count += 1;

    }
  );


  Object.values(
    result
  ).forEach(
    (group) => {

      group.percent =
        totalWeight > 0
          ? (
              group.weight /
              totalWeight
            ) *
            100
          : 0;

    }
  );


  return result;

}


/* =========================================================
   40. 등급별 색상 클래스
   ========================================================= */

function getRarityClass(
  fish
) {

  return (
    fish?.rarity ||
    "common"
  );

}


/* =========================================================
   41. HTML 안전 처리
   ---------------------------------------------------------
   랭킹 닉네임이나 물고기 이름 출력 시
   HTML 코드를 그대로 실행하지 않도록 합니다.
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   42. 현재 낚싯대 이름
   ---------------------------------------------------------
   STEP 1에서는 데이터 구조만 준비합니다.
   실제 구매 시스템은 다음 단계에서 구현합니다.
   ========================================================= */

const ROD_DATA = {

  starter_rod: {

    id: "starter_rod",

    name: "낡은 낚싯대",

    price: 0,

    rarityBonus: 0,

    difficultyBonus: 0

  },

  sturdy_rod: {

    id: "sturdy_rod",

    name: "튼튼한 낚싯대",

    price: 500,

    rarityBonus: 0.03,

    difficultyBonus: -0.05

  },

  silver_rod: {

    id: "silver_rod",

    name: "은빛 낚싯대",

    price: 2000,

    rarityBonus: 0.06,

    difficultyBonus: -0.10

  },

  golden_rod: {

    id: "golden_rod",

    name: "황금 낚싯대",

    price: 10000,

    rarityBonus: 0.10,

    difficultyBonus: -0.15

  },

  abyss_rod: {

    id: "abyss_rod",

    name: "심해의 낚싯대",

    price: 50000,

    rarityBonus: 0.16,

    difficultyBonus: -0.20

  }

};


function getRodName(
  rodId
) {

  return (
    ROD_DATA[
      rodId
    ]?.name ||
    ROD_DATA.starter_rod.name
  );

}


/* =========================================================
   43. 현재 미끼 표시
   ========================================================= */

function getBaitDisplay() {

  const amount =
    game.baits?.normal ?? 0;


  if (amount >= 9999) {
    return "일반 미끼 ×∞";
  }


  return (
    `일반 미끼 ×${formatNumber(amount)}`
  );

}


/* =========================================================
   44. STEP 1 - 3/6 완료
   ---------------------------------------------------------
   다음 파트:
   - 화면 렌더링
   - 도감 카드
   - 물고기 상세 정보
   - 낚시 기록
   - 확률표
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 4/6
   화면 렌더링 / 도감 / 상세 정보 / 기록
   ========================================================= */


/* =========================================================
   45. 메인 화면 렌더링
   ========================================================= */

function renderMain() {

  if (!el.score) {
    return;
  }


  /* -------------------------
     레벨 / XP
     ------------------------- */

  const level =
    getLevelFromScore(
      game.score
    );

  const xp =
    getXpInCurrentLevel(
      game.score
    );

  const requiredXp =
    getXpRequirement();


  /* -------------------------
     도감
     ------------------------- */

  const discovered =
    getDiscoveredCount();

  const total =
    FISH_DATA.length;

  const progress =
    total > 0
      ? (
          discovered /
          total
        ) *
        100
      : 0;


  /* -------------------------
     점수 / 골드 / 레벨
     ------------------------- */

  el.score.textContent =
    formatNumber(
      game.score
    );

  el.coins.textContent =
    formatNumber(
      game.coins
    );

  el.level.textContent =
    level;


  /* -------------------------
     XP 게이지
     ------------------------- */

  if (el.xpBar) {

    el.xpBar.style.width =
      `${xp}%`;

  }


  if (el.xpText) {

    el.xpText.textContent =
      `다음 레벨까지 ${
        requiredXp - xp
      } XP`;

  }


  if (el.xpValue) {

    el.xpValue.textContent =
      `${xp} / ${requiredXp} XP`;

  }


  /* -------------------------
     콤보
     ------------------------- */

  if (el.combo) {

    el.combo.textContent =
      game.combo;

  }


  if (el.badge) {

    el.badge.hidden =
      game.combo < 2;

  }


  /* -------------------------
     도감 숫자
     ------------------------- */

  if (el.discovered) {

    el.discovered.textContent =
      discovered;

  }


  if (el.totalSpecies) {

    el.totalSpecies.textContent =
      total;

  }


  if (el.collectionProgressBar) {

    el.collectionProgressBar.style.width =
      `${progress}%`;

  }


  /* -------------------------
     큰 도감 모달 숫자
     ------------------------- */

  if (el.modalDiscovered) {

    el.modalDiscovered.textContent =
      discovered;

  }


  if (el.modalTotalSpecies) {

    el.modalTotalSpecies.textContent =
      total;

  }


  if (el.collectionPercent) {

    el.collectionPercent.textContent =
      `${progress.toFixed(0)}% 발견`;

  }


  /* -------------------------
     장비
     ------------------------- */

  if (el.rodName) {

    el.rodName.textContent =
      getRodName(
        game.rod
      );

  }


  if (el.baitName) {

    el.baitName.textContent =
      getBaitDisplay();

  }

}


/* =========================================================
   46. 도감 카드 생성
   ========================================================= */

function createCollectionItem(
  fish
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "collection-item";


  button.dataset.fishId =
    fish.id;


  const found =
    isFound(
      fish.id
    );


  /* -------------------------
     발견 상태
     ------------------------- */

  if (found) {

    button.classList.add(
      "found"
    );

  } else {

    button.classList.add(
      "locked"
    );

  }


  /* -------------------------
     신화 + 미발견
     ------------------------- */

  if (
    fish.hidden &&
    !found
  ) {

    button.innerHTML = `
      <span class="collection-icon">
        ?
      </span>

      <span class="collection-name">
        미발견
      </span>
    `;

  }

  /* -------------------------
     일반 미발견
     ------------------------- */

  else if (!found) {

    button.innerHTML = `
      <span class="collection-icon">
        ?
      </span>

      <span class="collection-name">
        ???
      </span>
    `;

  }

  /* -------------------------
     발견
     ------------------------- */

  else {

    button.innerHTML = `
      <span class="collection-icon">
        ${fish.emoji}
      </span>

      <span class="collection-name">
        ${escapeHtml(
          fish.name
        )}
      </span>
    `;

  }


  /* -------------------------
     클릭 → 상세 정보
     ------------------------- */

  button.addEventListener(
    "click",
    () => {

      openFishDetail(
        fish.id
      );

    }
  );


  return button;

}


/* =========================================================
   47. 작은 도감 렌더링
   ========================================================= */

function renderCollection() {

  if (!el.grid) {
    return;
  }


  el.grid.innerHTML =
    "";


  FISH_DATA.forEach(
    (fish) => {

      el.grid.appendChild(
        createCollectionItem(
          fish
        )
      );

    }
  );


  /* -------------------------
     큰 도감
     ------------------------- */

  if (el.modalGrid) {

    el.modalGrid.innerHTML =
      "";


    FISH_DATA.forEach(
      (fish) => {

        el.modalGrid.appendChild(
          createCollectionItem(
            fish
          )
        );

      }
    );

  }

}


/* =========================================================
   48. 물고기 상세 정보 열기
   ========================================================= */

function openFishDetail(
  fishId
) {

  const fish =
    FISH_BY_ID[
      fishId
    ];


  if (!fish) {
    return;
  }


  const found =
    isFound(
      fish.id
    );


  const record =
    getFishRecord(
      fish.id
    );


  /* -------------------------
     아이콘
     ------------------------- */

  if (el.fishDetailIcon) {

    el.fishDetailIcon.textContent =
      found
        ? fish.emoji
        : fish.hidden
          ? "?"
          : "🐟";

  }


  /* -------------------------
     희귀도
     ------------------------- */

  if (el.fishDetailRarity) {

    el.fishDetailRarity.textContent =
      found
        ? getRarityLabel(
            fish
          )
        : "미발견";

  }


  /* -------------------------
     이름
     ------------------------- */

  if (el.fishDetailTitle) {

    el.fishDetailTitle.textContent =
      found
        ? fish.name
        : "???";

  }


  /* -------------------------
     설명
     ------------------------- */

  if (el.fishDetailDescription) {

    if (found) {

      el.fishDetailDescription.textContent =
        fish.description;

    }

    else if (
      fish.hidden
    ) {

      el.fishDetailDescription.textContent =
        "아직 아무도 정체를 밝혀내지 못했습니다.";

    }

    else {

      el.fishDetailDescription.textContent =
        "아직 잡지 못한 물고기입니다.";

    }

  }


  /* -------------------------
     서식지
     ------------------------- */

  if (el.fishDetailHabitat) {

    el.fishDetailHabitat.textContent =
      found
        ? fish.habitat
        : "???";

  }


  /* -------------------------
     난이도
     ------------------------- */

  if (el.fishDetailDifficulty) {

    if (found) {

      el.fishDetailDifficulty.textContent =
        "★".repeat(
          fish.difficulty
        ) +
        "☆".repeat(
          5 -
          fish.difficulty
        );

    }

    else {

      el.fishDetailDifficulty.textContent =
        "???";

    }

  }


  /* -------------------------
     발견 횟수
     ------------------------- */

  if (el.fishDetailCount) {

    el.fishDetailCount.textContent =
      `${record.count}회`;

  }


  /* -------------------------
     최고 길이
     ------------------------- */

  if (el.fishDetailBestLength) {

    el.fishDetailBestLength.textContent =
      record.bestLength > 0
        ? `${record.bestLength.toFixed(1)} cm`
        : "기록 없음";

  }


  /* -------------------------
     최고 무게
     ------------------------- */

  if (el.fishDetailBestWeight) {

    el.fishDetailBestWeight.textContent =
      record.bestWeight > 0
        ? `${record.bestWeight.toFixed(2)} kg`
        : "기록 없음";

  }


  /* -------------------------
     도감 번호
     ------------------------- */

  if (el.fishDetailId) {

    const index =
      FISH_DATA.findIndex(
        (item) => {
          return item.id === fish.id;
        }
      ) + 1;


    el.fishDetailId.textContent =
      `#${String(
        index
      ).padStart(
        3,
        "0"
      )}`;

  }


  /* -------------------------
     모달 열기
     ------------------------- */

  if (
    window.oceanCatchUI &&
    window.oceanCatchUI.openModal
  ) {

    window.oceanCatchUI.openModal(
      "fishDetailModal"
    );

  }

}


/* =========================================================
   49. 낚시 기록 아이콘
   ========================================================= */

function getFishIcon(
  fishId,
  fallbackEmoji
) {

  const fish =
    FISH_BY_ID[
      fishId
    ];


  if (fish) {

    return fish.emoji;

  }


  return (
    fallbackEmoji ||
    "🐟"
  );

}


/* =========================================================
   50. 낚시 기록 렌더링
   ========================================================= */

function renderLogs() {

  if (!el.logs) {
    return;
  }


  el.logs.innerHTML =
    "";


  /* -------------------------
     기록이 없을 때
     ------------------------- */

  if (
    !game.logs ||
    !game.logs.length
  ) {

    const empty =
      document.createElement(
        "li"
      );


    empty.className =
      "empty-log";


    empty.textContent =
      "첫 번째 낚시를 기다리고 있어요…";


    el.logs.appendChild(
      empty
    );


    return;

  }


  /* -------------------------
     최근 기록 출력
     ------------------------- */

  game.logs.forEach(
    (log) => {

      const li =
        document.createElement(
          "li"
        );


      const fish =
        FISH_BY_ID[
          log.fishId
        ];


      const emoji =
        getFishIcon(
          log.fishId,
          log.emoji
        );


      const name =
        log.name ||
        fish?.name ||
        "알 수 없는 물고기";


      const rarity =
        log.rarityName ||
        fish?.rarityName ||
        "일반";


      const xp =
        Number(
          log.xp || 0
        );


      const gold =
        Number(
          log.gold || 0
        );


      const length =
        Number(
          log.length || 0
        );


      const weight =
        Number(
          log.weight || 0
        );


      li.innerHTML = `
        <span class="log-catch-info">

          <span class="log-fish-name">

            ${emoji}

            ${escapeHtml(
              name
            )}

          </span>

          <small class="log-size">

            ${length > 0
              ? `${length.toFixed(1)} cm`
              : ""}

            ${weight > 0
              ? ` · ${weight.toFixed(2)} kg`
              : ""}

          </small>

        </span>


        <b class="rarity ${escapeHtml(
          log.rarity ||
          fish?.rarity ||
          "common"
        )}">

          ${escapeHtml(
            rarity
          )}

          · +${formatNumber(
            xp
          )} XP

          · +${formatNumber(
            gold
          )} G

        </b>
      `;


      el.logs.appendChild(
        li
      );

    }
  );

}


/* =========================================================
   51. 확률표 렌더링
   ========================================================= */

function renderProbabilityTable() {

  if (!el.probabilityTable) {
    return;
  }


  el.probabilityTable.innerHTML =
    "";


  const groups =
    getRarityProbability();


  /*
    표시 순서 고정
  */

  const order = [
    "trash",
    "common",
    "uncommon",
    "rare",
    "legendary",
    "mythic"
  ];


  order.forEach(
    (rarity) => {

      const group =
        groups[
          rarity
        ];


      if (!group) {
        return;
      }


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "probability-row";


      row.innerHTML = `
        <span>

          ${escapeHtml(
            group.rarityName
          )}

          <small>
            ${
              group.count
            }종
          </small>

        </span>

        <strong>

          ${
            group.percent.toFixed(
              2
            )
          }%

        </strong>
      `;


      el.probabilityTable.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   52. 전체 렌더링
   ========================================================= */

function renderAll() {

  renderMain();

  renderCollection();

  renderLogs();

  renderProbabilityTable();

}


/* =========================================================
   53. STEP 1 - 4/6 완료
   ---------------------------------------------------------
   현재까지:
   ✔ 35종 물고기
   ✔ 희귀도
   ✔ 출현 확률
   ✔ 난이도
   ✔ 길이
   ✔ 무게
   ✔ XP / GOLD
   ✔ 물고기 기록
   ✔ 도감
   ✔ 상세 정보
   ✔ 낚시 기록
   ✔ 확률표
   ---------------------------------------------------------
   다음 파트:
   - 실제 낚시 시작
   - 입질
   - 타이밍 게이지
   - 물고기별 난이도
   - 성공 / 실패
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 5/6
   실제 낚시 시스템
   ========================================================= */


/* =========================================================
   54. 타이밍 구간 설정
   ---------------------------------------------------------
   난이도가 높을수록 황금 구간이 좁아집니다.

   difficulty 1 → 매우 넓음
   difficulty 5 → 매우 좁음
   ========================================================= */

function setTimingArea(fish) {

  if (!el.sweetSpot || !fish) {
    return;
  }


  const widths = {

    1: 28,

    2: 23,

    3: 18,

    4: 14,

    5: 10

  };


  const width =
    widths[
      fish.difficulty
    ] || 18;


  const left =
    50 -
    width / 2;


  el.sweetSpot.style.left =
    `${left}%`;


  el.sweetSpot.style.width =
    `${width}%`;

}


/* =========================================================
   55. 현재 황금 구간 확인
   ========================================================= */

function getCurrentSweetSpot() {

  if (!el.sweetSpot) {

    return {

      left: 43,

      right: 61

    };

  }


  const left =
    parseFloat(
      el.sweetSpot.style.left
    ) || 43;


  const width =
    parseFloat(
      el.sweetSpot.style.width
    ) || 18;


  return {

    left,

    right:
      left + width

  };

}


/* =========================================================
   56. 낚시 버튼
   ========================================================= */

function cast() {

  /*
    아무것도 하지 않는 상태
    → 낚시 시작
  */

  if (
    state ===
    "idle"
  ) {

    beginCast();

    return;

  }


  /*
    입질 상태
    → 현재 바늘 위치에서 낚시 성공 판정
  */

  if (
    state ===
    "bite"
  ) {

    const position =
      Number(
        el.needle?.dataset?.pos ||
        0
      );


    resolve(
      position
    );

  }

}


/* =========================================================
   57. 낚시 시작
   ========================================================= */

function beginCast() {

  state =
    "waiting";


  currentBiteFish =
    null;


  /*
    낚시 버튼 잠금
  */

  if (el.button) {

    el.button.disabled =
      true;


    el.button.innerHTML =
      "🌊 기다리는 중…";

  }


  /*
    문구
  */

  if (el.status) {

    el.status.textContent =
      "미끼가 물속으로 가라앉고 있습니다…";

  }


  if (el.message) {

    el.message.textContent =
      "무언가 미끼를 노리고 있는 것 같습니다…";

  }


  /*
    바다 애니메이션 시작
  */

  if (el.oceanCard) {

    el.oceanCard.classList.add(
      "casting"
    );

  }


  /*
    간단한 캐스팅 효과음
  */

  sound(
    310,
    0.10,
    "triangle",
    0.04
  );


  /*
    어떤 물고기가 물지를 미리 결정
  */

  currentBiteFish =
    pickFish();


  /*
    입질까지 기다리는 시간
    0.9초 ~ 2.6초
  */

  const waitTime =
    900 +
    Math.random() *
      1700;


  clearTimeout(
    biteTimer
  );


  biteTimer =
    setTimeout(
      bite,
      waitTime
    );

}


/* =========================================================
   58. 입질
   ========================================================= */

function bite() {

  if (!currentBiteFish) {

    currentBiteFish =
      pickFish();

  }


  state =
    "bite";


  const fish =
    currentBiteFish;


  /*
    물고기 난이도에 맞춰
    황금 구간을 변경
  */

  setTimingArea(
    fish
  );


  /*
    CSS 애니메이션
  */

  if (el.oceanCard) {

    el.oceanCard.classList.add(
      "biting"
    );

  }


  /*
    타이밍 영역 표시
  */

  if (el.timing) {

    el.timing.hidden =
      false;

  }


  /*
    버튼 활성화
  */

  if (el.button) {

    el.button.disabled =
      false;


    el.button.innerHTML =
      "⚡ 지금 당기기!";

  }


  /*
    물고기 이름을 바로 공개하는 이유:
    이번 단계에서는 낚시 난이도 차이를
    테스트하기 쉽게 하기 위해 표시합니다.

    이후 실제 게임에서는
    "무언가 강하게 물었다!"
   처럼 숨길 수도 있습니다.
  */

  if (el.status) {

    el.status.textContent =
      `${fish.rarityName} 물고기의 입질! 황금 구간을 노려보세요!`;

  }


  if (el.timingHint) {

    el.timingHint.textContent =
      `난이도 ${
        fish.difficulty
      } / 5 · ${fish.rarityName}`;

  }


  /*
    입질 효과음
  */

  sound(
    720,
    0.12,
    "triangle",
    0.05
  );


  /* =======================================================
     게이지 이동
     ======================================================= */

  const start =
    performance.now();


  /*
    난이도가 높을수록
    바늘이 더 빠르게 움직입니다.
  */

  const speedTable = {

    1: 1400,

    2: 1250,

    3: 1100,

    4: 900,

    5: 700

  };


  const speed =
    speedTable[
      fish.difficulty
    ] || 1100;


  function move(
    now
  ) {

    /*
      입질이 끝났으면 중지
    */

    if (
      state !==
      "bite"
    ) {

      return;

    }


    const elapsed =
      now -
      start;


    const cycle =
      Math.floor(
        elapsed /
        speed
      );


    const progress =
      (
        elapsed %
        speed
      ) /
      speed;


    /*
      좌 → 우 → 좌 → 우
    */

    let position;


    if (
      cycle %
      2 ===
      0
    ) {

      position =
        progress *
        100;

    } else {

      position =
        (
          1 -
          progress
        ) *
        100;

    }


    /*
      신화/전설 물고기는
      아주 약간 불규칙하게 흔들립니다.
    */

    if (
      fish.difficulty >=
      5
    ) {

      position +=
        Math.sin(
          now / 85
        ) *
        2.5;

    }


    position =
      clamp(
        position,
        0,
        100
      );


    if (el.needle) {

      el.needle.style.left =
        `${position}%`;


      el.needle.dataset.pos =
        position;

    }


    needleTimer =
      requestAnimationFrame(
        move
      );

  }


  needleTimer =
    requestAnimationFrame(
      move
    );


  /* =======================================================
     도망가는 시간
     ======================================================= */


  clearTimeout(
    missTimer
  );


  /*
    난이도가 높을수록
    입질 시간이 짧습니다.
  */

  const biteDuration =
    3400 -
    (
      fish.difficulty -
      1
    ) *
      450;


  missTimer =
    setTimeout(
      () => {

        if (
          state ===
          "bite"
        ) {

          miss();

        }

      },
      biteDuration
    );

}


/* =========================================================
   59. 낚시 성공 / 실패 판정
   ========================================================= */

function resolve(
  position
) {

  cancelAnimationFrame(
    needleTimer
  );


  clearTimeout(
    missTimer
  );


  const fish =
    currentBiteFish ||
    pickFish();


  const sweet =
    getCurrentSweetSpot();


  /*
    PERFECT 구간
    물고기가 어려울수록
    PERFECT 범위도 좁아집니다.
  */

  const perfectMargin =

    fish.difficulty >= 5
      ? 2.5

      : fish.difficulty >= 4
        ? 3.5

        : 5;


  const perfect =
    position >=
      sweet.left +
      perfectMargin &&

    position <=
      sweet.right -
      perfectMargin;


  /*
    GOOD 구간
  */

  const good =
    position >=
      sweet.left &&

    position <=
      sweet.right;


  /*
    황금 구간 밖
    → 실패
  */

  if (!good) {

    miss();

    return;

  }


  /* =======================================================
     성공!
     ======================================================= */


  /*
    콤보를 먼저 증가시킨 후
    보상을 계산합니다.
  */

  game.combo +=
    1;


  /*
    길이 / 무게 생성
  */

  const catchData =
    generateFishCatch(
      fish
    );


  /*
    XP / GOLD 계산
  */

  const rewards =
    calculateRewards(
      fish,
      catchData,
      perfect
    );


  /*
    점수
  */

  game.score +=
    rewards.xp;


  /*
    골드
  */

  game.coins +=
    rewards.gold;


  /*
    새 도감 발견 여부
  */

  const isNew =
    markFound(
      fish
    );


  /*
    물고기 기록
  */

  updateFishRecord(
    fish,
    catchData
  );


  /* =======================================================
     새로운 물고기 발견 알림
     ======================================================= */

  if (isNew) {

    toast(
      `✨ 새 도감 발견: ${fish.name}!`
    );

  }


  /*
    희귀도별 추가 알림
  */

  if (
    fish.rarity ===
    "mythic"
  ) {

    toast(
      `🔱 신화 발견! ${fish.name}`
    );

  }

  else if (
    fish.rarity ===
    "legendary"
  ) {

    toast(
      `👑 전설 발견! ${fish.name}`
    );

  }

  else if (
    fish.rarity ===
    "rare"
  ) {

    toast(
      `💜 희귀 발견! ${fish.name}`
    );

  }


  /* =======================================================
     최근 기록 추가
     ======================================================= */

  game.logs.unshift({

    fishId:
      fish.id,

    emoji:
      fish.emoji,

    name:
      fish.name,

    rarity:
      fish.rarity,

    rarityName:
      fish.rarityName,

    length:
      catchData.length,

    weight:
      catchData.weight,

    xp:
      rewards.xp,

    gold:
      rewards.gold,

    combo:
      game.combo,

    timestamp:
      Date.now()

  });


  /*
    최근 기록 최대 12개
  */

  game.logs =
    game.logs.slice(
      0,
      12
    );


  /* =======================================================
     현재 잡은 물고기 정보
     ======================================================= */

  currentCatch = {

    fish,

    catchData,

    rewards,

    perfect,

    isNew

  };


  /*
    낚시 상태 종료
  */

  state =
    "idle";


  currentBiteFish =
    null;


  resetSea();


  /* =======================================================
     메인 화면 메시지
     ======================================================= */

  if (el.status) {

    el.status.textContent =
      perfect

        ? "🎯 PERFECT! 정확하게 낚아 올렸습니다!"

        : "🎣 좋은 타이밍이에요!";

  }


  if (el.message) {

    el.message.textContent =
      `${fish.emoji} ${fish.name}을(를) 낚았습니다!`;

  }


  if (el.button) {

    el.button.disabled =
      false;


    el.button.innerHTML =
      "🎣 한 번 더 낚시하기";

  }


  /*
    화면 갱신
  */

  renderAll();


  /*
    저장
  */

  save();


  /*
    캐치 연출
  */

  showCatchCelebration(
    currentCatch
  );


  /*
    희귀도별 효과음
  */

  playCatchSound(
    fish.rarity
  );


  /*
    10콤보 단위 달성 알림
  */

  if (
    game.combo >
      0 &&

    game.combo %
      10 ===
      0
  ) {

    toast(
      `🔥 ${game.combo} COMBO 달성!`
    );

  }

}


/* =========================================================
   60. 낚시 실패
   ========================================================= */

function miss() {

  state =
    "idle";


  cancelAnimationFrame(
    needleTimer
  );


  clearTimeout(
    biteTimer
  );


  clearTimeout(
    missTimer
  );


  currentBiteFish =
    null;


  /*
    콤보 초기화
  */

  game.combo =
    0;


  resetSea();


  if (el.status) {

    el.status.textContent =
      "앗, 물고기가 도망갔어요!";

  }


  if (el.message) {

    el.message.textContent =
      "다음엔 더 정확하게 낚아 보세요.";

  }


  if (el.button) {

    el.button.disabled =
      false;


    el.button.innerHTML =
      "🎣 다시 던지기";

  }


  renderAll();


  save();


  /*
    실패 효과음
  */

  sound(
    180,
    0.15,
    "sawtooth",
    0.035
  );

}


/* =========================================================
   61. 바다 초기화
   ========================================================= */

function resetSea() {

  clearTimeout(
    biteTimer
  );


  clearTimeout(
    missTimer
  );


  cancelAnimationFrame(
    needleTimer
  );


  if (el.oceanCard) {

    el.oceanCard.classList.remove(
      "casting",
      "biting"
    );

  }


  if (el.timing) {

    el.timing.hidden =
      true;

  }


  if (el.needle) {

    el.needle.style.left =
      "0%";

    el.needle.dataset.pos =
      "0";

  }

}


/* =========================================================
   62. 캐치 연출
   ========================================================= */

function showCatchCelebration(
  result
) {

  if (
    !result ||
    !el.catchCelebration
  ) {

    return;

  }


  const fish =
    result.fish;


  const catchData =
    result.catchData;


  /*
    기존 클래스 제거
  */

  el.catchCelebration.classList.remove(

    "trash-catch",

    "common-catch",

    "uncommon-catch",

    "rare-catch",

    "legendary-catch",

    "mythic-catch"

  );


  /*
    현재 희귀도 클래스 추가
  */

  el.catchCelebration.classList.add(

    `${getRarityClass(
      fish
    )}-catch`

  );


  if (
    el.catchRarityLabel
  ) {

    el.catchRarityLabel.textContent =
      fish.rarityName.toUpperCase();

  }


  if (
    el.catchTitle
  ) {

    el.catchTitle.textContent =
      fish.name;

  }


  if (
    el.catchSpec
  ) {

    el.catchSpec.textContent =
      `${catchData.length.toFixed(1)} cm · ` +
      `${catchData.weight.toFixed(2)} kg`;

  }


  /*
    애니메이션 시작
  */

  el.catchCelebration.setAttribute(
    "aria-hidden",
    "false"
  );


  el.catchCelebration.classList.add(
    "show"
  );


  clearTimeout(
    showCatchCelebration.timer
  );


  showCatchCelebration.timer =
    setTimeout(
      () => {

        el.catchCelebration.classList.remove(
          "show"
        );


        el.catchCelebration.setAttribute(
          "aria-hidden",
          "true"
        );

      },
      1500
    );


  /*
    결과 모달
  */

  showCatchResultModal(
    result
  );

}


/* =========================================================
   63. 결과 모달
   ========================================================= */

function showCatchResultModal(
  result
) {

  if (!result) {
    return;
  }


  const fish =
    result.fish;


  const catchData =
    result.catchData;


  const rewards =
    result.rewards;


  if (
    el.resultRarity
  ) {

    el.resultRarity.textContent =
      getRarityLabel(
        fish
      );

  }


  if (
    el.resultFishIcon
  ) {

    el.resultFishIcon.textContent =
      fish.emoji;

  }


  if (
    el.catchResultTitle
  ) {

    el.catchResultTitle.textContent =
      fish.name;

  }


  if (
    el.resultLength
  ) {

    el.resultLength.textContent =
      `${catchData.length.toFixed(1)} cm`;

  }


  if (
    el.resultWeight
  ) {

    el.resultWeight.textContent =
      `${catchData.weight.toFixed(2)} kg`;

  }


  if (
    el.resultXp
  ) {

    el.resultXp.textContent =
      `+${formatNumber(
        rewards.xp
      )} XP`;

  }


  if (
    el.resultGold
  ) {

    el.resultGold.textContent =
      `+${formatNumber(
        rewards.gold
      )} G`;

  }


  if (
    el.resultMessage
  ) {

    let message =
      "기록이 도감에 저장되었습니다.";


    /*
      큰 개체 판정
    */

    if (
      catchData.length >=
      fish.maxLength *
        0.8
    ) {

      message =
        "🐋 대형 개체입니다! 기록에 최고 길이를 갱신했을 수도 있어요.";

    }


    /*
      새로운 물고기
    */

    if (
      result.isNew
    ) {

      message +=
        " ✨ 새로운 물고기가 도감에 등록되었습니다!";

    }


    /*
      PERFECT
    */

    if (
      result.perfect
    ) {

      message +=
        " 🎯 PERFECT 보너스가 적용되었습니다!";

    }


    el.resultMessage.textContent =
      message;

  }


  /*
    흔한 물고기는 화면 연출만 보여주고
    결과 모달은 바로 띄우지 않습니다.

    희귀 이상부터 모달을 띄웁니다.
  */

  if (

    fish.rarity !==
      "trash" &&

    fish.rarity !==
      "common"

  ) {

    if (
      window.oceanCatchUI &&
      window.oceanCatchUI.openModal
    ) {

      window.oceanCatchUI.openModal(
        "catchResultModal"
      );

    }

  }

}


/* =========================================================
   64. 사운드 시스템
   ---------------------------------------------------------
   STEP 1에서는 Web Audio로 간단한 음향을 만듭니다.
   ========================================================= */

let audioContext =
  null;


function getAudioContext() {

  if (!soundOn) {

    return null;

  }


  if (!audioContext) {

    try {

      audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

    }

    catch {

      return null;

    }

  }


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext
      .resume()
      .catch(
        () => {}
      );

  }


  return audioContext;

}


function sound(
  frequency = 440,
  duration = 0.08,
  type = "sine",
  volume = 0.04
) {

  const ctx =
    getAudioContext();


  if (!ctx) {

    return;

  }


  const oscillator =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    frequency,
    ctx.currentTime
  );


  gain.gain.setValueAtTime(
    volume,
    ctx.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime +
      duration
  );


  oscillator
    .connect(
      gain
    )
    .connect(
      ctx.destination
    );


  oscillator.start();


  oscillator.stop(
    ctx.currentTime +
      duration
  );

}


/* =========================================================
   65. 희귀도별 캐치 사운드
   ========================================================= */

function playCatchSound(
  rarity
) {

  /*
    신화
  */

  if (
    rarity ===
    "mythic"
  ) {

    sound(
      130,
      0.20,
      "sawtooth",
      0.06
    );


    setTimeout(
      () => {

        sound(
          260,
          0.25,
          "sine",
          0.06
        );

      },
      90
    );


    setTimeout(
      () => {

        sound(
          520,
          0.35,
          "triangle",
          0.05
        );

      },
      180
    );


    return;

  }


  /*
    전설
  */

  if (
    rarity ===
    "legendary"
  ) {

    sound(
      330,
      0.13,
      "triangle",
      0.05
    );


    setTimeout(
      () => {

        sound(
          660,
          0.18,
          "triangle",
          0.05
        );

      },
      100
    );


    return;

  }


  /*
    희귀
  */

  if (
    rarity ===
    "rare"
  ) {

    sound(
      520,
      0.10,
      "sine",
      0.04
    );


    setTimeout(
      () => {

        sound(
          780,
          0.13,
          "sine",
          0.04
        );

      },
      90
    );


    return;

  }


  /*
    일반
  */

  sound(
    580,
    0.12,
    "sine",
    0.04
  );

}


/* =========================================================
   66. 낚시 이벤트 연결
   ========================================================= */

if (
  el.button
) {

  el.button.addEventListener(
    "click",
    cast
  );

}


/* =========================================================
   67. 소리 버튼
   ========================================================= */

$("soundButton")
  ?.addEventListener(
    "click",
    (
      event
    ) => {

      soundOn =
        !soundOn;


      event.currentTarget
        .textContent =
          soundOn
            ? "🔊"
            : "🔇";


      if (
        soundOn
      ) {

        sound(
          620,
          0.08,
          "sine",
          0.04
        );

      }

    }
  );


/* =========================================================
   68. 초기 렌더링
   ========================================================= */

renderAll();


/* =========================================================
   69. STEP 1 - 5/6 완료
   ---------------------------------------------------------
   이제 실제로:

   🎣 낚싯줄 던지기
   🌊 입질 기다리기
   ⚡ 타이밍 맞추기
   🐟 물고기별 난이도
   📏 길이
   ⚖️ 무게
   ✨ 도감 등록
   🪙 골드
   ⭐ XP
   🔥 콤보

   가 연결됩니다.

   다음 STEP 1 - 6/6에서는:
   - 로그인
   - Firebase 저장
   - 랭킹 TOP 10
   - 닉네임 등록
   - 모달 연결
   - 초기 실행
   을 넣습니다.
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 1 - 6/6
   Firebase 저장 / 로그인 / TOP 10 랭킹 / 초기화
   ========================================================= */


/* =========================================================
   70. Firebase 저장
   ========================================================= */

async function saveToCloud() {

  if (!auth || !db) {
    return;
  }

  const user =
    auth.currentUser;


  if (!user) {
    return;
  }


  try {

    await db
      .collection("users")
      .doc(user.uid)
      .set(
        {
          ...game,

          /*
            마지막 저장 시각
          */
          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        },
        {
          merge: true
        }
      );


  } catch (error) {

    console.warn(
      "Firebase 저장 실패:",
      error
    );

  }

}


/* =========================================================
   71. 저장 함수 교체
   ---------------------------------------------------------
   STEP 1에서는 로컬 저장을 즉시 하고
   로그인 상태라면 Firebase에도 저장합니다.
   ========================================================= */

function saveGame() {

  try {

    localStorage.setItem(
      "oceanCatchSave",
      JSON.stringify(game)
    );

  } catch (error) {

    console.error(
      "로컬 저장 실패:",
      error
    );

  }


  /*
    클라우드 저장
  */

  saveToCloud();

}


/* 기존 save() 이름도 계속 사용하기 위해 연결 */

window.save =
  saveGame;


/* =========================================================
   72. 클라우드 저장 데이터 불러오기
   ========================================================= */

async function loadCloudGame() {

  if (!auth || !db) {
    return;
  }


  const user =
    auth.currentUser;


  if (!user) {
    return;
  }


  try {

    const document =
      await db
        .collection("users")
        .doc(user.uid)
        .get();


    /*
      클라우드 저장 데이터가 없으면
      현재 로컬 데이터를 업로드
    */

    if (!document.exists) {

      await saveToCloud();

      return;

    }


    const cloudData =
      document.data();


    /*
      클라우드 데이터가 있으면
      새 구조에 맞춰 보정
    */

    game =
      normalizeGame(
        cloudData
      );


    renderAll();


    toast(
      "☁️ 클라우드 저장 데이터를 불러왔습니다!"
    );


  } catch (error) {

    console.warn(
      "클라우드 데이터 불러오기 실패:",
      error
    );

  }

}


/* =========================================================
   73. Google 로그인 UI
   ========================================================= */

function setupAuthentication() {

  if (!auth) {

    console.warn(
      "Firebase Auth를 사용할 수 없습니다."
    );

    return;

  }


  const loginButton =
    $("loginBtn");

  const logoutButton =
    $("logoutBtn");

  const userInfo =
    $("userInfo");


  /* ----------------------------------
     로그인
     ---------------------------------- */

  if (
    loginButton
  ) {

    loginButton.addEventListener(
      "click",
      async () => {

        try {

          const provider =
            new firebase.auth
              .GoogleAuthProvider();


          await auth.signInWithPopup(
            provider
          );


        } catch (error) {

          console.error(
            "Google 로그인 실패:",
            error
          );


          alert(
            "Google 로그인에 실패했습니다."
          );

        }

      }
    );

  }


  /* ----------------------------------
     로그아웃
     ---------------------------------- */

  if (
    logoutButton
  ) {

    logoutButton.addEventListener(
      "click",
      async () => {

        try {

          await auth.signOut();


          if (
            userInfo
          ) {

            userInfo.hidden =
              true;

          }


          if (
            logoutButton
          ) {

            logoutButton.hidden =
              true;

          }


          if (
            loginButton
          ) {

            loginButton.hidden =
              false;

          }


          toast(
            "로그아웃되었습니다."
          );


        } catch (error) {

          console.error(
            "로그아웃 실패:",
            error
          );

        }

      }
    );

  }


  /* ----------------------------------
     로그인 상태 감지
     ---------------------------------- */

  auth.onAuthStateChanged(
    async (user) => {

      if (user) {

        /*
          로그인 버튼 숨기기
        */

        if (
          loginButton
        ) {

          loginButton.hidden =
            true;

        }


        /*
          로그아웃 버튼 보이기
        */

        if (
          logoutButton
        ) {

          logoutButton.hidden =
            false;

        }


        /*
          사용자 정보
        */

        if (
          userInfo
        ) {

          userInfo.hidden =
            false;


          userInfo.textContent =
            `👋 ${
              user.displayName ||
              "낚시꾼"
            }님`;

        }


        /*
          클라우드 저장 불러오기
        */

        await loadCloudGame();


      } else {

        /*
          로그아웃 상태
        */

        if (
          loginButton
        ) {

          loginButton.hidden =
            false;

        }


        if (
          logoutButton
        ) {

          logoutButton.hidden =
            true;

        }


        if (
          userInfo
        ) {

          userInfo.hidden =
            true;

        }

      }

    }
  );

}


/* =========================================================
   74. 랭킹 데이터 불러오기
   ========================================================= */

async function loadLeaderboard() {

  const list =
    $("leaderboardList");


  if (!list) {
    return;
  }


  /*
    Firebase가 없으면
    안내 문구
  */

  if (!db) {

    list.innerHTML = `
      <li>
        랭킹 서버에 연결할 수 없습니다.
      </li>
    `;

    return;

  }


  try {

    const snapshot =
      await db
        .collection(
          "leaderboard"
        )
        .orderBy(
          "score",
          "desc"
        )
        .limit(10)
        .get();


    list.innerHTML =
      "";


    /*
      랭킹이 하나도 없는 경우
    */

    if (
      snapshot.empty
    ) {

      list.innerHTML = `
        <li>
          아직 등록된 랭킹이 없습니다.
        </li>
      `;

      return;

    }


    let rank =
      1;


    snapshot.forEach(
  (doc) => {
    const data =
      doc.data();

    const item =
      document.createElement(
        "li"
      );


        let rankLabel =
          `${rank}위`;


        if (
          rank === 1
        ) {

          rankLabel =
            "🥇 1위";

        }

        else if (
          rank === 2
        ) {

          rankLabel =
            "🥈 2위";

        }

        else if (
          rank === 3
        ) {

          rankLabel =
            "🥉 3위";

        }


        const nickname =
          escapeHtml(
            data.nickname ||
            "이름 없음"
          );


        const score =
          formatNumber(
            data.score || 0
          );


        item.innerHTML = `
          <span>
            ${rankLabel}
            &nbsp;
            ${nickname}
          </span>

          <strong>
            ${score}점
          </strong>
        `;


        list.appendChild(
          item
        );


        rank++;

      }
    );


  } catch (error) {

    console.error(
      "랭킹 불러오기 실패:",
      error
    );


    list.innerHTML = `
      <li>
        랭킹을 불러오지 못했습니다.
      </li>
    `;

  }

}


/* 기존 HTML의 onclick과 호환 */

window.loadLeaderboard =
  loadLeaderboard;


/* =========================================================
   75. 랭킹 등록 시작
   ========================================================= */

function submitScore() {

  /*
    점수 확인
  */

  if (
    !game ||
    Number(
      game.score
    ) <= 0
  ) {

    alert(
      "점수가 0점입니다!\n먼저 낚시를 해보세요."
    );

    return;

  }


  const modal =
    $("nicknameModal");


  const input =
    $("nicknameInput");


  if (
    !modal ||
    !input
  ) {

    return;

  }


  /*
    입력창 초기화
  */

  input.value =
    "";


  /*
    모달 열기
  */

  modal.hidden =
    false;


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  requestAnimationFrame(
    () => {

      modal.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      input.focus();

    },
    100
  );

}


/* HTML의 onclick을 위해 전역 함수로 공개 */

window.submitScore =
  submitScore;


/* =========================================================
   76. 닉네임 모달 닫기
   ========================================================= */

function closeNicknameModal() {

  const modal =
    $("nicknameModal");


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  setTimeout(
    () => {

      modal.hidden =
        true;

    },
    180
  );

}


window.closeNicknameModal =
  closeNicknameModal;


/* =========================================================
   77. 랭킹 등록
   ========================================================= */

async function confirmSubmitScore() {

  const input =
    $("nicknameInput");


  if (!input) {
    return;
  }


  const nickname =
    input.value.trim();


  /*
    닉네임 길이
  */

  if (
    nickname.length < 2
  ) {

    alert(
      "닉네임을 2자 이상 입력해주세요."
    );


    input.focus();


    return;

  }


  /*
    Firebase 확인
  */

  if (!db) {

    alert(
      "랭킹 서버에 연결되지 않았습니다."
    );

    return;

  }


  /*
    점수
  */

  const score =
    Number(
      game.score || 0
    );


  if (
    score <= 0
  ) {

    alert(
      "등록할 점수가 없습니다."
    );

    return;

  }


  try {

    /*
      랭킹 등록
    */

    await db
      .collection(
        "leaderboard"
      )
      .add({

        nickname:
          nickname,

        score:
          score,

        createdAt:
          firebase
            .firestore
            .FieldValue
            .serverTimestamp()

      });


    /*
      성공
    */

    closeNicknameModal();


    alert(
      "🎉 랭킹 등록이 완료되었습니다!"
    );


    /*
      새 랭킹 다시 불러오기
    */

    loadLeaderboard();


  } catch (error) {

    console.error(
      "랭킹 등록 실패:",
      error
    );


    alert(
      "랭킹 등록에 실패했습니다.\n" +
      error.message
    );

  }

}


window.confirmSubmitScore =
  confirmSubmitScore;


/* =========================================================
   78. 기록 전체 초기화
   ========================================================= */

function resetGame() {

  const answer =
    confirm(
      "정말 모든 게임 데이터를 초기화할까요?\n\n" +
      "점수 / 골드 / 도감 / 기록 / 콤보가 모두 초기화됩니다."
    );


  if (!answer) {
    return;
  }


  /*
    현재 로그인 계정과의 데이터 연동까지
    모두 초기화하지 않고,
    현재 게임 데이터만 초기화합니다.
  */

  game =
    createFreshGame();


  /*
    로컬 저장
  */

  try {

    localStorage.setItem(
      "oceanCatchSave",
      JSON.stringify(game)
    );

  } catch (error) {

    console.warn(
      "초기화 저장 실패:",
      error
    );

  }


  /*
    Firebase 저장
  */

  saveToCloud();


  /*
    화면 갱신
  */

  renderAll();


  /*
    게임 상태 초기화
  */

  state =
    "idle";


  currentBiteFish =
    null;


  currentCatch =
    null;


  resetSea();


  /*
    메시지
  */

  if (
    el.status
  ) {

    el.status.textContent =
      "새로운 항해를 시작해보세요.";

  }


  if (
    el.message
  ) {

    el.message.textContent =
      "오늘의 대어는 무엇일까요?";

  }


  if (
    el.button
  ) {

    el.button.disabled =
      false;


    el.button.innerHTML =
      "🎣 낚싯줄 던지기";

  }


  toast(
    "🌊 새로운 항해를 시작합니다!"
  );

}


/* HTML의 기존 resetButton과 연결 */

$("resetButton")
  ?.addEventListener(
    "click",
    resetGame
  );


/* =========================================================
   79. 도감 크게 보기
   ========================================================= */

$("openCollectionButton")
  ?.addEventListener(
    "click",
    () => {

      renderCollection();


      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.openModal
      ) {

        window.oceanCatchUI.openModal(
          "collectionModal"
        );

      }

    }
  );


/* =========================================================
   80. 상점 열기
   ---------------------------------------------------------
   실제 상품 구매는 STEP 2에서 구현합니다.
   ========================================================= */

$("shopButton")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.openModal
      ) {

        window.oceanCatchUI.openModal(
          "shopModal"
        );

      }

    }
  );


/* =========================================================
   81. 확률표 열기
   ========================================================= */

$("probabilityButton")
  ?.addEventListener(
    "click",
    () => {

      renderProbabilityTable();


      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.openModal
      ) {

        window.oceanCatchUI.openModal(
          "probabilityModal"
        );

      }

    }
  );


/* =========================================================
   82. 물고기 상세 모달 닫기
   ========================================================= */

$("closeFishDetail")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "fishDetailModal"
        );

      }

    }
  );


/* =========================================================
   83. 캐치 결과 모달 닫기
   ========================================================= */

$("closeCatchResult")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "catchResultModal"
        );

      }

    }
  );


$("closeCatchResultButton")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "catchResultModal"
        );

      }

    }
  );


/* =========================================================
   84. 상점 닫기
   ========================================================= */

$("closeShop")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "shopModal"
        );

      }

    }
  );


/* =========================================================
   85. 확률표 닫기
   ========================================================= */

$("closeProbability")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "probabilityModal"
        );

      }

    }
  );


/* =========================================================
   86. 전체 도감 닫기
   ========================================================= */

$("closeCollection")
  ?.addEventListener(
    "click",
    () => {

      if (
        window.oceanCatchUI &&
        window.oceanCatchUI.closeModal
      ) {

        window.oceanCatchUI.closeModal(
          "collectionModal"
        );

      }

    }
  );


/* =========================================================
   87. 모달 바깥 클릭으로 닫기
   ========================================================= */

document
  .querySelectorAll(
    ".modal-backdrop"
  )
  .forEach(
    (modal) => {

      modal.addEventListener(
        "click",
        (event) => {

          /*
            실제 모달 카드가 아니라
            어두운 배경을 클릭했을 때만 닫습니다.
          */

          if (
            event.target !==
            modal
          ) {

            return;

          }


          if (
            modal.id ===
            "nicknameModal"
          ) {

            closeNicknameModal();

            return;

          }


          if (
            window.oceanCatchUI &&
            window.oceanCatchUI.closeModal
          ) {

            window.oceanCatchUI.closeModal(
              modal.id
            );

          }

        }
      );

    }
  );


/* =========================================================
   88. ESC 키로 모달 닫기
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    document
      .querySelectorAll(
        ".modal-backdrop.show"
      )
      .forEach(
        (modal) => {

          if (
            modal.id ===
            "nicknameModal"
          ) {

            closeNicknameModal();

          }

          else if (
            window.oceanCatchUI &&
            window.oceanCatchUI.closeModal
          ) {

            window.oceanCatchUI.closeModal(
              modal.id
            );

          }

        }
      );

  }
);


/* =========================================================
   89. 랭킹 버튼
   ========================================================= */

$("submitScoreButton")
  ?.addEventListener(
    "click",
    submitScore
  );


/* =========================================================
   90. 인트로 시작 버튼
   ========================================================= */

$("startGameButton")
  ?.addEventListener(
    "click",
    () => {

      const intro =
        $("introScreen");


      if (!intro) {
        return;
      }


      localStorage.setItem(
        "oceanCatchIntroSeen",
        "1"
      );


      intro.classList.remove(
        "show"
      );


      intro.setAttribute(
        "aria-hidden",
        "true"
      );


      setTimeout(
        () => {

          intro.hidden =
            true;

        },
        450
      );


      /*
        첫 번째 클릭이 사용자 입력이므로
        Web Audio를 깨웁니다.
      */

      if (
        soundOn
      ) {

        getAudioContext();

      }


      toast(
        "🌊 항해를 시작합니다!"
      );

    }
  );


/* =========================================================
   91. 초기 실행
   ========================================================= */

function initializeGame() {

  /*
    데이터 수를 HTML과 동기화
  */

  if (
    el.totalSpecies
  ) {

    el.totalSpecies.textContent =
      FISH_DATA.length;

  }


  if (
    el.modalTotalSpecies
  ) {

    el.modalTotalSpecies.textContent =
      FISH_DATA.length;

  }


  /*
    화면 최초 렌더링
  */

  renderAll();


  /*
    확률표도 준비
  */

  renderProbabilityTable();


  /*
    Firebase 인증 시작
  */

  setupAuthentication();


  /*
    랭킹 로드
  */

  loadLeaderboard();


  /*
    인트로
  */

  const intro =
    $("introScreen");


  const introSeen =
    localStorage.getItem(
      "oceanCatchIntroSeen"
    );


  /*
    완전히 새로운 플레이어라면
    인트로 표시
  */

  if (
    intro &&
    !introSeen
  ) {

    intro.hidden =
      false;

    intro.setAttribute(
      "aria-hidden",
      "false"
    );

    requestAnimationFrame(
      () => {

        intro.classList.add(
          "show"
        );

      }
    );

  }

  else if (
    intro
  ) {

    intro.hidden =
      true;

    intro.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  /*
    개발 확인용 로그
  */

  console.log(
    "===================================="
  );

  console.log(
    "🎣 OCEAN CATCH 2.0"
  );

  console.log(
    "STEP 1 완료"
  );

  console.log(
    `🐟 등록된 물고기: ${FISH_DATA.length}종`
  );

  console.log(
    `📖 발견한 물고기: ${getDiscoveredCount()}종`
  );

  console.log(
    `💰 현재 골드: ${game.coins}`
  );

  console.log(
    `⭐ 현재 점수: ${game.score}`
  );

  console.log(
    "===================================="

  );

}


/* =========================================================
   92. 디버깅용 공개 객체
   ---------------------------------------------------------
   브라우저 개발자 도구에서:

   OceanCatch.game
   OceanCatch.fishData

   로 확인할 수 있습니다.
   ========================================================= */

window.OceanCatch = {

  game,

  fishData:
    FISH_DATA,

  fishById:
    FISH_BY_ID,

  rarity:
    FISH_BY_RARITY,

  getLevel:
    getLevelFromScore,

  getDiscovered:
    getDiscoveredCount,

  save:
    saveGame

};


/* =========================================================
   93. STEP 1 FINAL INITIALIZATION
   ========================================================= */

initializeGame();


/* =========================================================
   🎣 OCEAN CATCH 2.0
   STEP 1 - COMPLETE
   ========================================================= */
/* =========================================================
   OCEAN CATCH 2.0
   STEP 2 - 1/5
   골드 상점 / 낚싯대 구매 / 레벨 보상
   ========================================================= */


/* =========================================================
   1. STEP 2 상점 데이터
   ---------------------------------------------------------
   기존 ROD_DATA를 실제 구매 시스템으로 활성화합니다.
   ========================================================= */

const SHOP_RODS = [
  {
    id: "starter_rod",
    name: "낡은 낚싯대",
    price: 0,
    emoji: "🎣",
    description:
      "처음부터 사용할 수 있는 기본 낚싯대입니다.",
    rarityBonus: 0,
    difficultyBonus: 0
  },

  {
    id: "sturdy_rod",
    name: "튼튼한 낚싯대",
    price: 500,
    emoji: "🪵",
    description:
      "조작이 조금 더 안정적입니다. 희귀 물고기 보정 +3%.",
    rarityBonus: 0.03,
    difficultyBonus: -0.05
  },

  {
    id: "silver_rod",
    name: "은빛 낚싯대",
    price: 2000,
    emoji: "🥈",
    description:
      "좋은 장비의 시작입니다. 희귀 물고기 보정 +6%.",
    rarityBonus: 0.06,
    difficultyBonus: -0.10
  },

  {
    id: "golden_rod",
    name: "황금 낚싯대",
    price: 10000,
    emoji: "👑",
    description:
      "전설을 노리는 낚시꾼을 위한 고급 장비입니다. 희귀 보정 +10%.",
    rarityBonus: 0.10,
    difficultyBonus: -0.15
  },

  {
    id: "abyss_rod",
    name: "심해의 낚싯대",
    price: 50000,
    emoji: "🌊",
    description:
      "깊은 바다의 괴물을 노리는 최상급 낚싯대입니다. 희귀 보정 +16%.",
    rarityBonus: 0.16,
    difficultyBonus: -0.20
  }
];


/* =========================================================
   2. 게임 데이터 보정
   ---------------------------------------------------------
   예전 저장 데이터에 ownedRods가 없어도 자동 생성합니다.
   ========================================================= */

function ensureStep2GameData() {

  if (!game) {
    return;
  }


  if (!Array.isArray(game.ownedRods)) {

    game.ownedRods = [
      "starter_rod"
    ];

  }


  if (
    !game.ownedRods.includes(
      "starter_rod"
    )
  ) {

    game.ownedRods.unshift(
      "starter_rod"
    );

  }


  if (
    !Array.isArray(
      game.levelRewardsClaimed
    )
  ) {

    game.levelRewardsClaimed = [];

  }


  if (!game.rod) {

    game.rod =
      "starter_rod";

  }

}


ensureStep2GameData();


/* =========================================================
   3. 현재 낚싯대 데이터
   ========================================================= */

function getCurrentRod() {

  ensureStep2GameData();

  return (
    SHOP_RODS.find(
      (rod) =>
        rod.id === game.rod
    ) ||
    SHOP_RODS[0]
  );

}


/* =========================================================
   4. 낚싯대 보유 여부
   ========================================================= */

function ownsRod(
  rodId
) {

  ensureStep2GameData();

  return game.ownedRods.includes(
    rodId
  );

}


/* =========================================================
   5. 레벨 보상 계산
   ---------------------------------------------------------
   5레벨마다 골드를 지급합니다.

   LV 5  → 500G
   LV 10 → 750G
   LV 15 → 1,000G
   ...
   ========================================================= */

function getLevelReward(
  level
) {

  return (
    250 +
    level * 50
  );

}


/* =========================================================
   6. 레벨 보상 검사
   ---------------------------------------------------------
   현재 레벨까지의 5단위 보상을 확인하고
   아직 받지 않은 보상만 지급합니다.
   ========================================================= */

function claimLevelRewards() {

  ensureStep2GameData();


  const currentLevel =
    getLevelFromScore(
      game.score
    );


  const rewards = [];


  for (
    let level = 5;
    level <= currentLevel;
    level += 5
  ) {

    if (
      game.levelRewardsClaimed
        .includes(level)
    ) {

      continue;

    }


    const gold =
      getLevelReward(
        level
      );


    game.coins +=
      gold;


    game.levelRewardsClaimed.push(
      level
    );


    rewards.push({
      level,
      gold
    });

  }


  if (!rewards.length) {

    return false;

  }


  /*
    가장 최근 보상만 화면에 보여주고,
    여러 개가 쌓였다면 한 번에 합산 안내합니다.
  */

  const totalGold =
    rewards.reduce(
      (
        total,
        reward
      ) =>
        total +
        reward.gold,
      0
    );


  if (
    rewards.length === 1
  ) {

    toast(
      `🎁 LV.${rewards[0].level} 달성 보상 +${formatNumber(rewards[0].gold)} G`
    );

  } else {

    toast(
      `🎁 레벨 보상 ${rewards.length}개 획득! +${formatNumber(totalGold)} G`
    );

  }


  return true;

}


/* =========================================================
   7. 상점 렌더링
   ========================================================= */

function renderShop() {

  const content =
    $("shopContent");

  if (!content) {

    return;

  }


  ensureStep2GameData();


  content.innerHTML =
    "";


  SHOP_RODS.forEach(
    (rod) => {

      const owned =
        ownsRod(
          rod.id
        );


      const equipped =
        game.rod ===
        rod.id;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "shop-item";


      const priceText =
        rod.price <= 0
          ? "무료"
          : `${formatNumber(rod.price)} G`;


      let buttonText =
        "구매";


      if (equipped) {

        buttonText =
          "현재 장착";

      } else if (owned) {

        buttonText =
          "장착";

      }


      item.innerHTML = `
        <div class="shop-item-icon">
          ${rod.emoji}
        </div>

        <div>
          <div class="shop-item-title">
            ${escapeHtml(rod.name)}
          </div>

          <div class="shop-item-description">
            ${escapeHtml(rod.description)}
          </div>

          <div class="shop-item-price">
            ${priceText}
          </div>
        </div>

        <button
          type="button"
          class="shop-buy-button"
          data-rod-id="${rod.id}"
          ${equipped ? "disabled" : ""}
        >
          ${buttonText}
        </button>
      `;


      const button =
        item.querySelector(
          ".shop-buy-button"
        );


      if (button) {

        button.addEventListener(
          "click",
          () => {

            buyOrEquipRod(
              rod.id
            );

          }
        );

      }


      content.appendChild(
        item
      );

    }
  );


  /*
    현재 골드 안내
  */

  const wallet =
    document.createElement(
      "div"
    );


  wallet.className =
    "shop-empty";


  wallet.style.marginBottom =
    "2px";


  wallet.innerHTML = `
    🪙 현재 보유 골드
    <strong style="color: var(--gold); margin-left: 6px;">
      ${formatNumber(game.coins)} G
    </strong>
  `;


  content.prepend(
    wallet
  );

}


/* =========================================================
   8. 낚싯대 구매 / 장착
   ========================================================= */

function buyOrEquipRod(
  rodId
) {

  ensureStep2GameData();


  const rod =
    SHOP_RODS.find(
      (item) =>
        item.id === rodId
    );


  if (!rod) {

    toast(
      "존재하지 않는 낚싯대입니다."
    );

    return;

  }


  /*
    이미 보유했다면 장착
  */

  if (
    ownsRod(
      rodId
    )
  ) {

    game.rod =
      rodId;


    save();


    renderMain();

    renderShop();


    toast(
      `🎣 ${rod.name} 장착!`
    );

    return;

  }


  /*
    골드 부족
  */

  if (
    game.coins <
    rod.price
  ) {

    const shortage =
      rod.price -
      game.coins;


    toast(
      `🪙 골드가 ${formatNumber(shortage)} G 부족합니다.`
    );

    return;

  }


  /*
    구매
  */

  game.coins -=
    rod.price;


  game.ownedRods.push(
    rodId
  );


  game.rod =
    rodId;


  save();


  renderMain();

  renderShop();


  toast(
    `🎣 ${rod.name} 구매 및 장착 완료!`
  );

}


/* =========================================================
   9. 상점 탭
   ---------------------------------------------------------
   현재는 낚싯대부터 구현합니다.
   미끼 시스템은 STEP 2 후반에 확장합니다.
   ========================================================= */

let step2ShopTab =
  "rod";


function renderBaitShopPlaceholder() {

  const content =
    $("shopContent");

  if (!content) {

    return;

  }


  ensureStep2GameData();


  content.innerHTML = `
    <div class="shop-empty">
      <strong style="color: var(--cyan);">
        🪱 미끼 시스템 준비 중
      </strong>

      <br><br>

      다음 업데이트에서
      <br>
      일반 / 희귀 / 전설 / 신화 미끼가 추가됩니다.
    </div>
  `;

}


$("rodShopTab")
  ?.addEventListener(
    "click",
    () => {

      step2ShopTab =
        "rod";


      $("rodShopTab")
        ?.classList.add(
          "active"
        );


      $("baitShopTab")
        ?.classList.remove(
          "active"
        );


      $("rodShopTab")
        ?.setAttribute(
          "aria-selected",
          "true"
        );


      $("baitShopTab")
        ?.setAttribute(
          "aria-selected",
          "false"
        );


      renderShop();

    }
  );


$("baitShopTab")
  ?.addEventListener(
    "click",
    () => {

      step2ShopTab =
        "bait";


      $("baitShopTab")
        ?.classList.add(
          "active"
        );


      $("rodShopTab")
        ?.classList.remove(
          "active"
        );


      $("baitShopTab")
        ?.setAttribute(
          "aria-selected",
          "true"
        );


      $("rodShopTab")
        ?.setAttribute(
          "aria-selected",
          "false"
        );


      renderBaitShopPlaceholder();

    }
  );


/* =========================================================
   10. 기존 상점 버튼에 렌더링 연결
   ========================================================= */

$("shopButton")
  ?.addEventListener(
    "click",
    () => {

      step2ShopTab =
        "rod";


      $("rodShopTab")
        ?.classList.add(
          "active"
        );


      $("baitShopTab")
        ?.classList.remove(
          "active"
        );


      renderShop();

    }
  );


/* =========================================================
   11. 레벨 보상 연결
   ---------------------------------------------------------
   기존 낚시 로직을 건드리지 않고,
   renderMain 호출 때마다 보상 여부를 확인합니다.
   ========================================================= */

const step2OriginalRenderMain =
  renderMain;


renderMain =
  function () {

    ensureStep2GameData();


    /*
      먼저 기존 화면 렌더링
    */

    step2OriginalRenderMain();


    /*
      레벨 보상 지급
    */

    const rewardClaimed =
      claimLevelRewards();


    /*
      보상이 실제로 지급됐다면
      다시 골드 화면을 업데이트합니다.
    */

    if (
      rewardClaimed
    ) {

      step2OriginalRenderMain();

      save();

    }

  };


/* =========================================================
   12. 최초 STEP 2 데이터 저장
   ========================================================= */

ensureStep2GameData();

save();


console.log(
  "Ocean Catch STEP 2 - 1/5 loaded"
);
/* =========================================================
   OCEAN CATCH 2.0
   STEP 2 - 2/5
   낚싯대 능력치 실제 적용
   ========================================================= */


/* =========================================================
   1. 희귀도별 행운 보정 배율
   ---------------------------------------------------------
   좋은 낚싯대일수록 높은 등급에 더 큰 보정이 들어갑니다.
   ========================================================= */

const ROD_RARITY_MULTIPLIER = {
  trash: 0,
  common: 0.35,
  uncommon: 0.75,
  rare: 1.5,
  legendary: 2.5,
  mythic: 4
};


/* =========================================================
   2. 낚싯대 적용 확률 계산
   ========================================================= */

function getRodAdjustedWeight(fish) {

  if (!fish) {
    return 0;
  }


  const rod =
    getCurrentRod();


  const base =
    Number(
      fish.probability
    ) || 0;


  const rarityMultiplier =
    ROD_RARITY_MULTIPLIER[
      fish.rarity
    ] ?? 1;


  /*
    rarityBonus가 0.10이면
    전설에는 25%의 가중치 증가,
    신화에는 40%의 가중치 증가가 적용됩니다.

    이것은 기존 확률을 완전히 뒤집지 않으면서
    좋은 장비의 차이를 체감시키기 위한 방식입니다.
  */

  const bonus =
    Number(
      rod.rarityBonus
    ) *
    rarityMultiplier;


  return (
    base *
    (1 + bonus)
  );

}


/* =========================================================
   3. 낚싯대 적용 물고기 선택
   ---------------------------------------------------------
   기존 pickFish()를 교체합니다.
   ========================================================= */

const step2OriginalPickFish =
  pickFish;


pickFish =
  function () {

    ensureStep2GameData();


    /*
      사용할 물고기 목록
    */

    if (
      !FISH_DATA ||
      !FISH_DATA.length
    ) {

      return null;

    }


    /*
      낚싯대 보정 확률이 적용된
      임시 목록 생성
    */

    const adjustedFish =
      FISH_DATA.map(
        (fish) => ({
          fish,
          probability:
            getRodAdjustedWeight(
              fish
            )
        })
      );


    /*
      기존 weightedRandom()을
      그대로 활용합니다.
    */

    const picked =
      weightedRandom(
        adjustedFish,
        "probability"
      );


    return (
      picked?.fish ||
      step2OriginalPickFish()
    );

  };


/* =========================================================
   4. 낚시 난이도 / 황금 구간 보정
   ---------------------------------------------------------
   좋은 낚싯대를 사용할수록 황금 구간이 넓어집니다.
   ========================================================= */

const step2OriginalSetTimingArea =
  setTimingArea;


setTimingArea =
  function (fish) {

    if (
      !fish ||
      !el.sweetSpot
    ) {

      return;

    }


    const rod =
      getCurrentRod();


    /*
      기존 물고기 난이도를 기준으로
      기본 황금 구간을 계산합니다.
    */

    const widths = {
      1: 28,
      2: 23,
      3: 18,
      4: 14,
      5: 10
    };


    const baseWidth =
      widths[
        fish.difficulty
      ] || 18;


    /*
      -0.05 → 약 5% 넓어짐
      -0.10 → 약 10% 넓어짐
      -0.15 → 약 15% 넓어짐
      -0.20 → 약 20% 넓어짐
    */

    const multiplier =
      1 -
      Number(
        rod.difficultyBonus || 0
      );


    /*
      지나치게 쉬워지지 않도록 제한
    */

    const finalWidth =
      Math.min(
        38,
        Math.max(
          8,
          baseWidth *
          multiplier
        )
      );


    const left =
      50 -
      finalWidth / 2;


    el.sweetSpot.style.left =
      `${left}%`;


    el.sweetSpot.style.width =
      `${finalWidth}%`;

  };


/* =========================================================
   5. 확률표도 낚싯대 적용 확률을 사용
   ========================================================= */

const step2OriginalGetRarityProbability =
  getRarityProbability;


getRarityProbability =
  function () {

    ensureStep2GameData();


    const result = {};

    let totalWeight =
      0;


    /*
      현재 낚싯대가 적용된
      실제 가중치 계산
    */

    FISH_DATA.forEach(
      (fish) => {

        const weight =
          getRodAdjustedWeight(
            fish
          );


        totalWeight +=
          weight;


        if (
          !result[
            fish.rarity
          ]
        ) {

          result[
            fish.rarity
          ] = {

            rarity:
              fish.rarity,

            rarityName:
              fish.rarityName,

            weight: 0,

            count: 0

          };

        }


        result[
          fish.rarity
        ].weight +=
          weight;


        result[
          fish.rarity
        ].count +=
          1;

      }
    );


    /*
      퍼센트 계산
    */

    Object.values(
      result
    ).forEach(
      (group) => {

        group.percent =
          totalWeight > 0
            ? (
                group.weight /
                totalWeight
              ) *
              100
            : 0;

      }
    );


    return result;

  };


/* =========================================================
   6. 확률표 상단에 현재 낚싯대 표시
   ========================================================= */

const step2OriginalRenderProbabilityTable =
  renderProbabilityTable;


renderProbabilityTable =
  function () {

    step2OriginalRenderProbabilityTable();


    if (
      !el.probabilityTable
    ) {

      return;

    }


    const rod =
      getCurrentRod();


    const note =
      document.createElement(
        "div"
      );


    note.className =
      "shop-empty";


    note.style.marginBottom =
      "10px";


    note.innerHTML = `
      🎣 현재 장비:
      <strong style="color: var(--cyan);">
        ${escapeHtml(rod.name)}
      </strong>
      <br>
      희귀 보정 +${Math.round(
        rod.rarityBonus * 100
      )}%
    `;


    el.probabilityTable.prepend(
      note
    );

  };


/* =========================================================
   7. 낚싯대 변경 후 화면 전체 즉시 갱신
   ========================================================= */

const step2OriginalBuyOrEquipRod =
  buyOrEquipRod;


buyOrEquipRod =
  function (rodId) {

    step2OriginalBuyOrEquipRod(
      rodId
    );


    /*
      장비 변경 직후
      확률표와 메인 UI까지 갱신합니다.
    */

    renderMain();


    renderProbabilityTable();

  };


/* =========================================================
   8. 콘솔 확인용
   ========================================================= */

console.log(
  "STEP 2 - 2/5: 낚싯대 능력치 적용 완료"
);

console.log(
  "현재 낚싯대:",
  getCurrentRod().name
);

console.log(
  "희귀 보정:",
  getCurrentRod().rarityBonus
);

console.log(
  "난이도 보정:",
  getCurrentRod().difficultyBonus
);