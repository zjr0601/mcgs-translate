// 拼接规则表 — 基于命名规范的 15 条模式匹配规则
// 每条规则定义：中文正则 → 提取组 → 英文模板 + Token 查找序列

import { TOKEN_ZH_TO_EN } from './tokens';
import { FIXED_PHRASE_MAP } from './fixed-phrases';

// ---- Token lookup helpers ----

/** 查找单个 Token 的英文 */
export function lookupToken(zh: string): string | null {
  // Try exact match first (fixed phrase or token)
  if (FIXED_PHRASE_MAP.has(zh)) return FIXED_PHRASE_MAP.get(zh)!;
  if (TOKEN_ZH_TO_EN.has(zh)) return TOKEN_ZH_TO_EN.get(zh)!;
  return null;
}

/** 对任意中文文本做最长 Token 匹配拼接 */
export function spliceByTokens(text: string): string {
  if (!text) return '';
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;
    // Try all tokens in length-descending order (global ALL_TOKENS is sorted)
    for (const [zh, en] of TOKEN_ZH_TO_EN) {
      if (remaining.startsWith(zh)) {
        parts.push(en);
        remaining = remaining.slice(zh.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // No token match — use the remaining as-is (will be handled by DeepL later)
      parts.push(remaining);
      break;
    }
  }

  let result = parts.join('_');
  // Collapse multiple underscores from token concatenation
  result = result.replace(/_+/g, '_').replace(/_$/, '').replace(/^_/, '');
  return result;
}

// ---- Rule types ----

export interface SplicingRule {
  name: string;
  // Regex must match the Chinese pattern with capture groups
  pattern: RegExp;
  // Given regex matches, produce the English translation (null = not matched by this rule)
  apply: (m: RegExpMatchArray) => string | null;
}

// ===== 15 Splice Rules =====

export const RULES: SplicingRule[] = [
  // --- Rule 1: Servo full name ---
  // "A档Cassette伺服" → "A_Cassette"
  {
    name: 'servo-full-name',
    pattern: /^(.+?档)(.+?伺服)$/,
    apply: (m) => {
      const deviceEn = lookupToken(m[1]); // e.g. "A档" → "A_"
      const funcEn = lookupToken(m[2]);   // e.g. "Cassette伺服" → "Cassette"
      if (deviceEn && funcEn) return `${deviceEn}${funcEn}`;
      // fallback: splice everything
      return spliceByTokens(m[1] + m[2]);
    },
  },

  // --- Rule 2: Servo position name ---
  // "G1进篮横移伺服A道进篮位" → "G1_X_Axis_#A_Bsk_In"
  // Pattern: {Device}{Func}伺服{Position}
  {
    name: 'servo-position-name',
    pattern: /^(.+?)(进篮横移伺服|出篮横移伺服|横移伺服|升降伺服|旋转伺服|归正伺服|传动伺服|吸片横移伺服|侧齿伺服)(.+)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const axisEn = lookupToken(m[2]) || spliceByTokens(m[2]);
      const posEn = spliceByTokens(m[3]);
      return `${deviceEn}_${axisEn}_${posEn}`;
    },
  },

  // --- Rule 3: Operation record (4-segment splice) ---
  // "G1进篮横移伺服A道进篮参数修改：由{OV}-->改为{CV}"
  // → "G1_X_Axis_#A_Bsk_In_Parameter Setting:{OV}-->{CV}"
  {
    name: 'operation-record-modify',
    pattern: /^(.+?)(参数修改|参数设定)：由\{OV\}-->(?:改)?为\{CV\}$/,
    apply: (m) => {
      const prefixEn = spliceByTokens(m[1]);
      const actionEn = lookupToken(m[2]) || 'Parameter Setting';
      return `${prefixEn}_${actionEn}:{OV}-->{CV}`;
    },
  },

  // --- Rule 4: General operation record ---
  // "{Prefix}参数设定" → "{Prefix}_Parameter Setting"
  {
    name: 'operation-record-general',
    pattern: /^(.+?)(参数设定|参数修改)$/,
    apply: (m) => {
      const prefixEn = spliceByTokens(m[1]);
      const actionEn = lookupToken(m[2]) || 'Parameter Setting';
      return `${prefixEn}_${actionEn}`;
    },
  },

  // --- Rule 5: Cylinder full name ---
  // "A下层传动1进篮阻挡气缸" → "A_DownConvey1_In_Block"
  // Pattern: {Device}{Location}{Function}气缸
  {
    name: 'cylinder-full-name',
    pattern: /^(.+?)([阻挡夹压侧顶归定正伸进后拍离吸破吹预风抓].*?)(气缸)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const funcEn = spliceByTokens(m[2]);
      return `${deviceEn}_${funcEn}`;
    },
  },

  // --- Rule 6: Cylinder action ---
  // "{气缸名}伸出" → "{CylinderName}Work"
  // "{气缸名}缩回" → "{CylinderName}Home"
  {
    name: 'cylinder-action',
    pattern: /^(.+?)(伸出|缩回)$/,
    apply: (m) => {
      const nameEn = spliceByTokens(m[1]);
      const actionEn = m[2] === '伸出' ? 'Work' : 'Home';
      return `${nameEn}_${actionEn}`;
    },
  },

  // --- Rule 7: Motor full name ---
  // "A道上层传动1电机" → "#A_UpConvey1"
  // Pattern: {Device}{Layer}{Function}电机
  {
    name: 'motor-full-name',
    pattern: /^(.+?)(上层|下层)?(.*?)(传动\d*|横移传动|输送传动)(?:电机)?$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const layerEn = m[2] ? lookupToken(m[2]) || '' : '';
      const funcEn = spliceByTokens(m[3] + (m[4] || ''));
      const parts = [deviceEn, layerEn, funcEn].filter(Boolean);
      return parts.join('_');
    },
  },

  // --- Rule 8: IO signal name ---
  // "A1档吸盘硅片检测" → "#A1_Sucker_WaferCheckSensor"
  // Pattern: {Device}{位置}{传感器类型}
  {
    name: 'io-signal',
    pattern: /^(.+?)(到位检测|有片检测|硅片到位检测|硅片检测|双片检测|正反检测|盲区检测|防掉片|边缘检测|进片检测|进片前检测|水平检测|花篮检测|舟检测|伸出到位|缩回到位|到位)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const sensorEn = lookupToken(m[2]) || spliceByTokens(m[2]);
      return `${deviceEn}_${sensorEn}`;
    },
  },

  // --- Rule 9: Servo alarm ---
  // "{ServoName}轴异常" → "{ServoName}_Aixs_AxisErr"
  // Note: intentional misspelling "Aixs" preserved
  {
    name: 'servo-alarm',
    pattern: /^(.+?)(轴异常|正限位|负限位|限位报警|使能报警|扭矩报警|同步报警|运行报警)$/,
    apply: (m) => {
      const servoEn = spliceByTokens(m[1]);
      const alarmEn = lookupToken(m[2]) || spliceByTokens(m[2]);
      return `${servoEn}_Aixs_${alarmEn}`;
    },
  },

  // --- Rule 10: Cylinder alarm ---
  // "{CylinderName}伸出报警" → "{CylinderName}_GoWork_Fault"
  // "{CylinderName}缩回报警" → "{CylinderName}_GoHome_Fault"
  {
    name: 'cylinder-alarm',
    pattern: /^(.+?)(伸出|缩回)报警$/,
    apply: (m) => {
      const cylEn = spliceByTokens(m[1]);
      const type = m[2] === '伸出' ? 'GoWork_Fault' : 'GoHome_Fault';
      return `${cylEn}_${type}`;
    },
  },

  // --- Rule 11: Motor alarm ---
  // "{MotorName}过载报警" → "{MotorName}_Overload_Alarm"
  {
    name: 'motor-alarm',
    pattern: /^(.+?)(过载报警|变频器报警|正转报警|反转报警)$/,
    apply: (m) => {
      const motorEn = spliceByTokens(m[1]);
      const alarmEn = lookupToken(m[2]) || 'Alarm';
      return `${motorEn}_${alarmEn}`;
    },
  },

  // --- Rule 12: Safety door ---
  // "{Device}上方安全门" → "{Device}_UpperSafetyDoor"
  // "{Device}下方安全门" → "{Device}_LowerSafetyDoor"
  {
    name: 'safety-door',
    pattern: /^(.+?)(上方安全门|下方安全门|安全门)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const doorEn = lookupToken(m[2]) || 'SafetyDoor';
      return `${deviceEn}_${doorEn}`;
    },
  },

  // --- Rule 13: Conveyor layer ---
  // "{Device}上层传动{Function}" → "{Device}_UpConvey_{Function}"
  // "{Device}下层传动{Function}" → "{Device}_DownConvey_{Function}"
  {
    name: 'conveyor-layer',
    pattern: /^(.+?)(上层|下层)(.+)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const layerEn = lookupToken(m[2])!;
      const restEn = spliceByTokens(m[3]);
      return `${deviceEn}_${layerEn}_${restEn}`;
    },
  },

  // --- Rule 14: UI control label ---
  // "{Device}确认按钮" → "{Device}_OK"
  // "{Device}复位按钮" → "{Device}_Reset"
  // "{Device}暂停按钮" → "{Device}_Pause"
  {
    name: 'ui-control',
    pattern: /^(.+?)(确认按钮|复位按钮|暂停按钮|运行指示灯|停止指示灯|红灯|黄灯|绿灯|蜂鸣器|指示灯)$/,
    apply: (m) => {
      const deviceEn = spliceByTokens(m[1]);
      const controlEn = lookupToken(m[2]) || spliceByTokens(m[2]);
      return `${deviceEn}_${controlEn}`;
    },
  },

  // --- Rule 15: Spare / reserved ---
  // "备用1", "备用2" ... → "Spare1", "Spare2" ...
  {
    name: 'spare',
    pattern: /^备用(\d*)$/,
    apply: (m) => {
      return m[1] ? `Spare${m[1]}` : 'Spare';
    },
  },
];
