// 原子 Token 表 — 可自由组合的最小翻译单元
// 按 category 分组，按 zh 长度降序排列（长 Token 优先匹配）

export interface TokenEntry {
  zh: string;
  en: string;
  category: 'device' | 'servo_func' | 'servo_pos' | 'cylinder' | 'motor' | 'io_sensor' | 'alarm' | 'system' | 'layer' | 'direction' | 'number';
}

// 按长度降序，保证最长前缀匹配
const DEVICE_TOKENS: TokenEntry[] = [
  { zh: 'Robot1', en: 'Robot1', category: 'device' },
  { zh: 'Robot2', en: 'Robot2', category: 'device' },
  { zh: 'Square', en: 'Square', category: 'device' },
  { zh: 'G1', en: 'G1', category: 'device' },
  { zh: 'G2', en: 'G2', category: 'device' },
  // Slot-level (A1~A4, B1~B4) — must match before lane-level
  { zh: 'A4档', en: '#A4_', category: 'device' },
  { zh: 'A3档', en: '#A3_', category: 'device' },
  { zh: 'A2档', en: '#A2_', category: 'device' },
  { zh: 'A1档', en: '#A1_', category: 'device' },
  { zh: 'B4档', en: '#B4_', category: 'device' },
  { zh: 'B3档', en: '#B3_', category: 'device' },
  { zh: 'B2档', en: '#B2_', category: 'device' },
  { zh: 'B1档', en: '#B1_', category: 'device' },
  // Lane-level
  { zh: 'A档', en: 'A_', category: 'device' },
  { zh: 'B档', en: 'B_', category: 'device' },
  { zh: 'A侧', en: 'A_', category: 'device' },
  { zh: 'B侧', en: 'B_', category: 'device' },
  { zh: 'A道', en: '#A_', category: 'device' },
  { zh: 'B道', en: '#B_', category: 'device' },
  { zh: 'C道', en: '#C_', category: 'device' },
  { zh: 'D道', en: '#D_', category: 'device' },
  { zh: 'E道', en: '#E_', category: 'device' },
  { zh: 'F道', en: '#F_', category: 'device' },
];

const SERVO_FUNC_TOKENS: TokenEntry[] = [
  { zh: 'Cassette伺服', en: 'Cassette', category: 'servo_func' },
  { zh: 'Buffer伺服', en: 'Buffer', category: 'servo_func' },
  { zh: '吸片横移伺服', en: 'Pick', category: 'servo_func' },
  { zh: '硅片归正伺服', en: 'Align', category: 'servo_func' },
  { zh: '硅片传动1伺服', en: 'Convey1', category: 'servo_func' },
  { zh: '硅片传动2伺服', en: 'Convey2', category: 'servo_func' },
  { zh: '归正伺服', en: 'Align', category: 'servo_func' },
  { zh: '传动伺服', en: 'Convey', category: 'servo_func' },
  { zh: '升降伺服', en: 'Z_Axis', category: 'servo_func' },
  { zh: '横移伺服', en: 'X_Axis', category: 'servo_func' },
  { zh: '侧齿伺服', en: 'Y_Axis', category: 'servo_func' },
  { zh: '旋转伺服', en: 'R_Axis', category: 'servo_func' },
  { zh: '步进传动', en: 'StepMotor', category: 'servo_func' },
];

const SERVO_POS_TOKENS: TokenEntry[] = [
  // Long, specific positions first
  { zh: 'A道进篮位', en: '#A_Bsk_In', category: 'servo_pos' },
  { zh: 'B道进篮位', en: '#B_Bsk_In', category: 'servo_pos' },
  { zh: 'A道出篮位', en: '#A_Bsk_Out', category: 'servo_pos' },
  { zh: 'B道出篮位', en: '#B_Bsk_Out', category: 'servo_pos' },
  { zh: 'A道进篮', en: '#A_Bsk_In', category: 'servo_pos' },
  { zh: 'B道进篮', en: '#B_Bsk_In', category: 'servo_pos' },
  { zh: 'A道出篮', en: '#A_Bsk_Out', category: 'servo_pos' },
  { zh: 'B道出篮', en: '#B_Bsk_Out', category: 'servo_pos' },
  // General positions
  { zh: '首片位', en: 'First_Wafer', category: 'servo_pos' },
  { zh: '进篮位', en: 'Bsk_In', category: 'servo_pos' },
  { zh: '出篮位', en: 'Bsk_Out', category: 'servo_pos' },
  { zh: '初始位', en: 'Init_Pos', category: 'servo_pos' },
  { zh: '取片位', en: 'GetPos', category: 'servo_pos' },
  { zh: '放片位', en: 'PutPos', category: 'servo_pos' },
  { zh: '收片位', en: 'GetPos', category: 'servo_pos' },
  { zh: '进片位', en: 'Wafer_In', category: 'servo_pos' },
  { zh: '夹紧位', en: 'Clamp', category: 'servo_pos' },
  { zh: '松开位', en: 'Release', category: 'servo_pos' },
  { zh: '检测位', en: 'Detect', category: 'servo_pos' },
  { zh: '下降位', en: 'Lower', category: 'servo_pos' },
  // Short forms
  { zh: '首片', en: 'First_Wafer', category: 'servo_pos' },
  { zh: '进篮', en: 'Bsk_In', category: 'servo_pos' },
  { zh: '出篮', en: 'Bsk_Out', category: 'servo_pos' },
  { zh: '初始', en: 'Init_Pos', category: 'servo_pos' },
  { zh: '取片', en: 'GetPos', category: 'servo_pos' },
  { zh: '放片', en: 'PutPos', category: 'servo_pos' },
];

const CYLINDER_TOKENS: TokenEntry[] = [
  { zh: '吸盘升降气缸', en: 'SuckerLift', category: 'cylinder' },
  { zh: '定位气缸', en: 'Position', category: 'cylinder' },
  { zh: '阻挡气缸', en: 'Block', category: 'cylinder' },
  { zh: '夹紧气缸', en: 'Clamp', category: 'cylinder' },
  { zh: '压紧气缸', en: 'Clamp', category: 'cylinder' },
  { zh: '侧压气缸', en: 'SideClamp', category: 'cylinder' },
  { zh: '顶升气缸', en: 'Lift', category: 'cylinder' },
  { zh: '归正气缸', en: 'Align', category: 'cylinder' },
  { zh: '正压气缸', en: 'PosPressure', category: 'cylinder' },
  { zh: '伸缩气缸', en: 'Extend', category: 'cylinder' },
  { zh: '进片气缸', en: 'WaferIn', category: 'cylinder' },
  { zh: '后推气缸', en: 'Push', category: 'cylinder' },
  { zh: '拍齐气缸', en: 'Align', category: 'cylinder' },
  { zh: '拍正气缸', en: 'Align', category: 'cylinder' },
  { zh: '抓手夹紧', en: 'Gripper', category: 'cylinder' },
  { zh: '离子除静电', en: 'Ionize', category: 'cylinder' },
  { zh: '吸真空', en: 'SuckVacuum', category: 'cylinder' },
  { zh: '破真空', en: 'BreakVacuum', category: 'cylinder' },
  { zh: '预吹气', en: 'PreBlow', category: 'cylinder' },
  { zh: '风刀', en: 'AirKnife', category: 'cylinder' },
  { zh: '吸盘', en: 'Sucker', category: 'cylinder' },
  { zh: '吹气', en: 'Blow', category: 'cylinder' },
];

const MOTOR_TOKENS: TokenEntry[] = [
  { zh: '横移传动', en: 'Traverse', category: 'motor' },
  { zh: '输送传动', en: 'Transfer', category: 'motor' },
  { zh: '传动电机', en: 'Convey', category: 'motor' },
  { zh: '上层传动', en: 'UpConvey', category: 'motor' },
  { zh: '下层传动', en: 'DownConvey', category: 'motor' },
  { zh: '进篮传动', en: 'InConvey', category: 'motor' },
  { zh: '出篮传动', en: 'OutConvey', category: 'motor' },
  { zh: '进满篮传动', en: 'InFullConvey', category: 'motor' },
  { zh: '出满篮传动', en: 'OutFullConvey', category: 'motor' },
  { zh: '步进', en: 'StepMotor', category: 'motor' },
];

const IO_SENSOR_TOKENS: TokenEntry[] = [
  { zh: '硅片到位检测', en: 'WaferStopSensor', category: 'io_sensor' },
  { zh: '进片前检测', en: 'PreInCheckSensor', category: 'io_sensor' },
  { zh: '花篮检测', en: 'BskCheckSensor', category: 'io_sensor' },
  { zh: '舟检测', en: 'BoatCheckSensor', category: 'io_sensor' },
  { zh: '有片检测', en: 'WaferCheckSensor', category: 'io_sensor' },
  { zh: '双片检测', en: 'DoubleCheck', category: 'io_sensor' },
  { zh: '正反检测', en: 'DirectionCheck', category: 'io_sensor' },
  { zh: '盲区检测', en: 'AreaCheck', category: 'io_sensor' },
  { zh: '防掉片', en: 'AreaCheck', category: 'io_sensor' },
  { zh: '边缘检测', en: 'EdgeCheckSensor', category: 'io_sensor' },
  { zh: '进片检测', en: 'InCheckSensor', category: 'io_sensor' },
  { zh: '水平检测', en: 'LevelCheckSensor', category: 'io_sensor' },
  { zh: '到位检测', en: 'CheckSensor', category: 'io_sensor' },
  { zh: '伸出到位', en: 'WorkSensor', category: 'io_sensor' },
  { zh: '缩回到位', en: 'HomeSensor', category: 'io_sensor' },
  { zh: '光栅', en: 'SafetyCheckSensor', category: 'io_sensor' },
  { zh: '伸出线圈', en: 'WorkOut', category: 'io_sensor' },
  { zh: '缩回线圈', en: 'HomeOut', category: 'io_sensor' },
  { zh: '确认按钮', en: 'OK', category: 'io_sensor' },
  { zh: '复位按钮', en: 'Reset', category: 'io_sensor' },
  { zh: '暂停按钮', en: 'Pause', category: 'io_sensor' },
  { zh: '电机正转', en: 'Motor_FWD', category: 'io_sensor' },
  { zh: '电机反转', en: 'Motor_REV', category: 'io_sensor' },
  { zh: '高速输出', en: 'Motor_HighSpeed', category: 'io_sensor' },
  { zh: '低速输出', en: 'Motor_LowSpeed', category: 'io_sensor' },
  { zh: '吹气输出', en: 'BlowOut', category: 'io_sensor' },
  { zh: '吸真空输出', en: 'SuckOut', category: 'io_sensor' },
  { zh: '运行指示灯', en: 'RunLight', category: 'io_sensor' },
  { zh: '停止指示灯', en: 'StopLight', category: 'io_sensor' },
  { zh: '红灯', en: 'RedLight', category: 'io_sensor' },
  { zh: '黄灯', en: 'YellowLight', category: 'io_sensor' },
  { zh: '绿灯', en: 'GreenLight', category: 'io_sensor' },
  { zh: '蜂鸣器', en: 'Buzzer', category: 'io_sensor' },
  { zh: '指示灯', en: 'Light', category: 'io_sensor' },
  { zh: '硅片检测', en: 'WaferCheckSensor', category: 'io_sensor' },
];

// Layer & direction tokens
const LAYER_TOKENS: TokenEntry[] = [
  { zh: '上层', en: 'Up', category: 'layer' },
  { zh: '下层', en: 'Down', category: 'layer' },
  { zh: '上方', en: 'Upper', category: 'layer' },
  { zh: '下方', en: 'Lower', category: 'layer' },
];

const DIRECTION_TOKENS: TokenEntry[] = [
  { zh: '正转', en: 'FWD', category: 'direction' },
  { zh: '反转', en: 'REV', category: 'direction' },
  { zh: '高速', en: 'HighSpeed', category: 'direction' },
  { zh: '低速', en: 'LowSpeed', category: 'direction' },
];

// Number tokens (for conveyor numbering: 传动1→Convey1)
const NUMBER_TOKENS: TokenEntry[] = [
  { zh: '1', en: '1', category: 'number' },
  { zh: '2', en: '2', category: 'number' },
  { zh: '3', en: '3', category: 'number' },
  { zh: '4', en: '4', category: 'number' },
  { zh: '5', en: '5', category: 'number' },
  { zh: '6', en: '6', category: 'number' },
  { zh: '7', en: '7', category: 'number' },
  { zh: '8', en: '8', category: 'number' },
  { zh: '9', en: '9', category: 'number' },
];

// All tokens sorted by zh length descending — LONGEST MATCH FIRST
export const ALL_TOKENS: TokenEntry[] = [
  ...DEVICE_TOKENS,
  ...SERVO_FUNC_TOKENS,
  ...SERVO_POS_TOKENS,
  ...CYLINDER_TOKENS,
  ...MOTOR_TOKENS,
  ...IO_SENSOR_TOKENS,
  ...LAYER_TOKENS,
  ...DIRECTION_TOKENS,
  ...NUMBER_TOKENS,
].sort((a, b) => b.zh.length - a.zh.length);

// Build lookup maps
export const TOKEN_ZH_TO_EN = new Map<string, string>();
for (const t of ALL_TOKENS) {
  // Only insert if shorter zh doesn't overwrite longer (already sorted desc)
  if (!TOKEN_ZH_TO_EN.has(t.zh)) {
    TOKEN_ZH_TO_EN.set(t.zh, t.en);
  }
}
