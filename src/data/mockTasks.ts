import type { CipherTask, DictionaryEntry } from '@/types';
import { generateId } from '@/utils/cipher';

const PLAINTEXTS: Array<{
  title: string;
  text: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}> = [
  {
    title: '紧急求救信号',
    text: 'THE WASTELAND SURVIVORS NEED MEDICAL SUPPLY URGENTLY STOP WE ARE HIDING IN THE OLD BUNKER NEAR THE RAILWAY STATION STOP SEND HELP AT ONCE STOP',
    source: '南方废墟巡逻队 · 频道 7.3 MHz',
    difficulty: 'easy',
    hint: '英文中 E 是出现频率最高的字母，密文中出现最多的字符很可能代表 E。',
  },
  {
    title: '商队路线情报',
    text: 'MERCHANT CARAVAN WILL DEPART FROM THE NORTHERN GATE AT DAWN CARRYING FRESH WATER AND SEEDS STOP AVOID THE EASTERN PASS DANGEROUS RADIATION ZONE STOP MEET AT THE BROKEN BRIDGE',
    source: '自由商人联盟 · 加密电报',
    difficulty: 'medium',
    hint: '注意重复出现的单词模式，比如 "STOP" 在老式电报中常用作句子分隔符。',
  },
  {
    title: '密令：黄昏行动',
    text: 'OPERATION TWILIGHT COMMENCES UPON RECEIPT OF THIS MESSAGE STOP ALL AGENTS PROCEED TO DESIGNATED RENDEZVOUS POINT DELTA STOP MAINTAIN RADIO SILENCE UNTIL FURTHER NOTICE STOP DESTROY THIS TRANSMISSION AFTER DECRYPTION',
    source: '匿名来源 · 高优先级加密',
    difficulty: 'hard',
    hint: 'THE, AND, OF, TO, IN 是英文中最常见的单词，尝试从短单词入手。',
  },
  {
    title: '前哨站日志摘录',
    text: 'DAY 47 WITHOUT CONTACT WITH HEADQUARTERS STOP FOOD STOCKS RUNNING LOW STOP MORALE IS WEAK BUT WE HOLD THE LINE STOP IF ANYONE RECEIVES THIS TRANSMIT OUR COORDINATES SECTOR 7 GRID 12 STOP',
    source: '前哨站 7-G · 每日广播',
    difficulty: 'medium',
    hint: '关注 "STOP" 的模式和 "ING" 词尾，这些是替换密码的重要突破口。',
  },
];

function generateCipherTasks(): CipherTask[] {
  return PLAINTEXTS.map((p) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    const cipherMap: Record<string, string> = {};
    for (let i = 0; i < alphabet.length; i++) {
      cipherMap[alphabet[i]] = shuffled[i];
    }

    let ciphertext = '';
    for (const ch of p.text) {
      if (/[A-Z]/.test(ch)) {
        ciphertext += cipherMap[ch];
      } else {
        ciphertext += ch;
      }
    }

    const now = new Date().toISOString();
    return {
      id: generateId(),
      title: p.title,
      ciphertext,
      plaintextAnswer: p.text,
      source: p.source,
      difficulty: p.difficulty,
      status: 'in_progress',
      substitutionMap: {},
      markers: [],
      notes: '',
      hint: p.hint,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export const MOCK_TASKS: CipherTask[] = generateCipherTasks();

export const MOCK_DICTIONARY: DictionaryEntry[] = [
  { id: generateId(), word: 'WASTELAND', category: '地理', description: '末日浩劫后形成的荒芜废土区域' },
  { id: generateId(), word: 'SURVIVOR', category: '身份', description: '大灾变后幸存的人类' },
  { id: generateId(), word: 'BUNKER', category: '设施', description: '防辐射地下避难所/碉堡' },
  { id: generateId(), word: 'CARAVAN', category: '组织', description: '废土上的商队，通常武装押运物资' },
  { id: generateId(), word: 'RADIATION', category: '威胁', description: '核辐射，废土主要危险之一' },
  { id: generateId(), word: 'HEADQUARTERS', category: '设施', description: '组织的总部/指挥部' },
  { id: generateId(), word: 'TRANSMISSION', category: '通讯', description: '无线电信号传输/电报' },
  { id: generateId(), word: 'DECRYPTION', category: '技术', description: '解密过程，破译密文' },
  { id: generateId(), word: 'RENDEZVOUS', category: '行动', description: '约定的会合地点' },
  { id: generateId(), word: 'OUTPOST', category: '设施', description: '前哨站，边境观察据点' },
  { id: generateId(), word: 'COORDINATES', category: '导航', description: '地理坐标，用于定位' },
  { id: generateId(), word: 'SECTOR', category: '地理', description: '区域/扇区，废土的划分单位' },
  { id: generateId(), word: 'MORALE', category: '状态', description: '士气，团队精神状态' },
  { id: generateId(), word: 'STOP', category: '通讯', description: '老式电报中用于表示句子结束的分隔符' },
  { id: generateId(), word: 'SILENCE', category: '通讯', description: '无线电静默，避免被侦测' },
  { id: generateId(), word: 'AGENT', category: '身份', description: '特工/情报人员' },
  { id: generateId(), word: 'SUPPLY', category: '物资', description: '补给品，包括食物、水、药品等' },
  { id: generateId(), word: 'URGENT', category: '优先级', description: '紧急，需要立即处理' },
  { id: generateId(), word: 'OPERATION', category: '行动', description: '有计划的军事/情报行动' },
  { id: generateId(), word: 'DESIGNATED', category: '指令', description: '指定的，预先安排好的' },
];
