import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Constitution } from '../data/constitutions';

export type Member = {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  constitutions: Constitution[]; // 改为多选
  healthTags: string[];
  avoidList: string[];
};

export type ModelConfig = {
  provider: string;
  model: string;
  endpoint: string;
  apiKey: string;
};

export type EatRecord = {
  id: string;
  timestamp: number;
  content: string; // 文本或图片路径
  type: 'text' | 'image';
  feedback?: string; // AI点评
};

export type AppState = {
  family: string;
  province: string;
  city: string;
  currentMemberId: string;
  members: Member[];
  model: ModelConfig;
  eatRecords: EatRecord[]; // 新增想吃记录
};

export const defaultState: AppState = {
  family: '我的家',
  province: '浙江',
  city: '杭州',
  currentMemberId: 'm1',
  members: [
    { id: 'm1', name: '妈妈', gender: '女', age: 36, constitutions: ['平和质'], healthTags: [], avoidList: [] },
  ],
  model: {
    provider: 'SenseNova',
    model: 'SenseNova-U1',
    endpoint: 'https://api.sensenova.cn/v1/chat/completions',
    apiKey: '',
  },
  eatRecords: [],
};

const key = 'jiahe-yangsheng-state-v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);

    // 数据迁移/兼容：处理旧版单选体质
    if (parsed.members && Array.isArray(parsed.members)) {
      parsed.members = parsed.members.map((m: any) => {
        if (m.constitution && !m.constitutions) {
          m.constitutions = [m.constitution];
          delete m.constitution;
        }
        // 确保 constitutions 永远是一个数组
        if (!Array.isArray(m.constitutions)) {
          m.constitutions = ['平和质'];
        }
        return m;
      });
    }

    return { ...defaultState, ...parsed };
  } catch (e) {
    console.log("数据加载失败，重置为默认值:", e);
    return defaultState;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(state));
}
