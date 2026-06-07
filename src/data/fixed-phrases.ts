// 固定短语表 — 不可拆分的完整短语（系统UI、状态文本、报警模板等）
// 翻译引擎首先查此表做精确匹配

export type FixedPhrase = [zh: string, en: string];

// ===== 系统状态 =====
const SYSTEM_STATUS: FixedPhrase[] = [
  ['系统自动运行', 'System_Running'],
  ['系统停止按钮', 'System_Stop'],
  ['系统复位按钮', 'System_Reset'],
  ['系统手/自动', 'System_Manual/Auto'],
  ['系统初始化中', 'SystemInit'],
  ['系统准备好', 'SystemInitOK'],
  ['系统运行中', 'SystemRunning'],
  ['系统停止中', 'SystemStop'],
  ['系统暂停中', 'SystemPause'],
  ['系统紧急停止中', 'SystemEMS'],
  ['手动状态', 'Manual'],
  ['自动状态', 'Auto'],
  ['手动调试', 'Manual'],
  ['系统状态：', 'System Status：'],
  ['系统运行指示灯', 'System_RunLight'],
  ['系统停止指示灯', 'System_StopLight'],
  ['系统_红灯', 'System_RedLight'],
  ['系统_黄灯', 'System_YellowLight'],
  ['系统_绿灯', 'System_GreenLight'],
  ['系统_蜂鸣器', 'System_Buzzer'],
  ['系统_初始化', 'System_Initial'],
];

// ===== 系统操作/用户管理 =====
const SYSTEM_OPERATION: FixedPhrase[] = [
  ['用户登录', 'User login'],
  ['用户退出', 'User exit'],
  ['用户管理', 'User Management'],
  ['密码管理', 'Password Management'],
  ['权限管理', 'Log On'],
  ['登录名：', 'User：'],
  ['未登录', 'NO Users'],
  ['时间：', 'Time：'],
  ['日期：', 'Date：'],
  ['系统操作', 'System'],
  ['系统状态', 'System Status'],
];

// ===== 伺服通用术语 =====
const SERVO_GENERAL: FixedPhrase[] = [
  ['寸动量', 'JOG Step'],
  ['手动速度', 'JOG Speed'],
  ['点动速度', 'JOG Speed'],
  ['加速度', 'ACC Speed'],
  ['减速度', 'DEC Speed'],
  ['回零速度', 'Home Speed'],
  ['使能', 'SRVON'],
  ['原点', 'Home'],
  ['当前位置', 'Current Position'],
  ['目标位置', 'Target Position'],
  ['当前速度', 'Current Speed'],
  ['伺服', 'Servo'],
];

// ===== 伺服报警 =====
const SERVO_ALARM: FixedPhrase[] = [
  // Note: intentional misspelling "Aixs" preserved from legacy codebase
  ['轴异常', 'AxisErr'],
  ['正限位', 'CWLimit'],
  ['负限位', 'CCWLimit'],
  ['限位报警', 'Limit_Alarm'],
  ['使能报警', 'SRVON_Alarm'],
  ['扭矩报警', 'Torque_Alarm'],
  ['同步报警', 'Gear_Alarm'],
  ['运行报警', 'Running_Alarm'],
];

// ===== 电机通用 =====
const MOTOR_GENERAL: FixedPhrase[] = [
  ['过载报警', 'Overload_Alarm'],
  ['变频器报警', 'Inverter_Alarm'],
  ['电机', 'Motor'],
];

// ===== 气缸通用 =====
const CYLINDER_GENERAL: FixedPhrase[] = [
  ['伸出', 'Work'],
  ['缩回', 'Home'],
  ['伸出到位', 'WorkDone'],
  ['缩回到位', 'HomeDone'],
  ['气缸', 'Cylinder'],
  ['伸出到位(传感器)', 'WorkSensor'],
  ['缩回到位(传感器)', 'HomeSensor'],
];

// ===== 通用操作 =====
const GENERAL_OPERATION: FixedPhrase[] = [
  ['参数修改', 'Parameter Setting'],
  ['参数设定', 'Parameter Setting'],
  ['由{OV}-->改为{CV}', ':{OV}-->{CV}'],
  ['产量统计', 'Qty'],
  ['总产量清零', 'Reset Total Qty'],
  ['操作记录', 'Operation Records'],
  ['报警查询', 'Alarm'],
  ['实时报警', 'Current Alarm'],
  ['历史报警', 'Historical Alarm'],
  ['报警', 'Alarm'],
  ['手动操作', 'Manual Operation'],
  ['自动运行', 'Auto Running'],
  ['自动监控', 'Auto Monitor'],
  ['手动', 'Manual'],
  ['自动', 'Auto'],
  ['耦合', 'GearIn'],
  ['解耦', 'GearOut'],
  ['生产统计', 'Production'],
  ['运行时间', 'Run Time'],
  ['运行时间清零', 'Reset Run Time'],
  ['停止时间', 'Stop Time'],
  ['时段', 'Time Period'],
  ['片间距设定', 'Wafer Gap Setting'],
  ['产量', 'Qty'],
  ['A班总产量:', 'Shift A Total Qty:'],
  ['B班总产量:', 'Shift B Total Qty:'],
];

// ===== 设备部件（不可拆的专有名词） =====
const DEVICE_PARTS: FixedPhrase[] = [
  ['卡盒', 'Stack'],
  ['皮带', 'Conveyor'],
  ['花篮横移', 'Bsk'],
  ['归正', 'Correct'],
  ['Buffer', 'Buffer'],
  ['Cassette', 'Cassette'],
  ['Robot', 'Robot'],
  ['急停', 'EMO'],
  ['备用', 'Spare'],
  ['安全门', 'SafetyDoor'],
  ['上方安全门', 'UpperSafetyDoor'],
  ['下方安全门', 'LowerSafetyDoor'],
  ['光栅', 'SafetyCheckSensor'],
  ['龙门', 'Gantry'],
  ['舟', 'Boat'],
  ['花篮', 'Basket'],
];

// ===== HMI 页面标签（不可拆的 UI 名词） =====
const HMI_PAGE_LABELS: FixedPhrase[] = [
  ['I/O页面', 'I/O Page'],
  ['运行监控', 'Run Monitor'],
  ['通讯监控', 'Communication Monitor'],
  ['实时查询', 'Real-time Query'],
  ['历史查询', 'History Query'],
  ['扭矩设定', 'Torque Setting'],
  ['当前扭矩', 'Current Torque'],
  ['伺服控制', 'Servo Control'],
  ['气缸控制', 'Cylinder Control'],
  ['电机控制', 'Motor Control'],
  ['报表文档', 'Report Document'],
  ['回零完成', 'Homing Done'],
  ['耦合完成', 'GearIn Done'],
  ['参数设置', 'Parameter Setting'],
  ['流程监控', 'Flow Monitor'],
  ['轴运行中', 'Axis Running'],
  ['正转运行中', 'FWD Running'],
  ['反转运行中', 'REV Running'],
  ['伺服参数', 'Servo Parameter'],
  ['电机参数', 'Motor Parameter'],
  ['气缸参数', 'Cylinder Parameter'],
  ['IO监控', 'I/O Monitor'],
  ['报警设置', 'Alarm Setting'],
  ['系统设置', 'System Setting'],
  ['配方管理', 'Recipe Management'],
  ['维护保养', 'Maintenance'],
  ['调试模式', 'Debug Mode'],
  ['工程师模式', 'Engineer Mode'],
  ['操作员模式', 'Operator Mode'],
  ['登录', 'Login'],
  ['退出', 'Logout'],
  ['保存', 'Save'],
  ['取消', 'Cancel'],
  ['确认', 'Confirm'],
  ['删除', 'Delete'],
  ['修改', 'Modify'],
  ['添加', 'Add'],
  ['搜索', 'Search'],
  ['导出', 'Export'],
  ['导入', 'Import'],
  ['刷新', 'Refresh'],
];

// ===== 剩余通用术语 =====
const MISC: FixedPhrase[] = [
  ['当前状态', 'Current Status'],
  ['I输入', 'I Input'],
  ['Q输出', 'Q Output'],
  ['马达操作', 'Motor Operation'],
  ['在线', 'Online'],
  ['离线', 'Offline'],
  ['主机功能', 'Host Function'],
  ['主机当前状态:', 'Host Current Status:'],
  ['无', 'None'],
  ['方阻功能选择', 'Resistance Function Select'],
  ['其他功能选择', 'Other Function Select'],
  ['主机离线:', 'Host Offline:'],
  ['雌黄开关', 'Reed Switch'],
  ['JOG+', 'JOG+'],
  ['JOG-', 'JOG-'],
  ['寸动+', 'JOG+'],
  ['寸动-', 'JOG-'],
  ['数据操作', 'Data Operation'],
  ['上一页', 'Prev Page'],
  ['下一页', 'Next Page'],
  ['数据保存', 'Save Data'],
  ['数据读取', 'Load Data'],
  ['轴代码', 'Axis Code'],
  ['驱动器代码', 'Drive Code'],
  ['正软限位', 'CW Soft Limit'],
  ['负软限位', 'CCW Soft Limit'],
  ['运行中', 'Running'],
  ['回零', 'Home'],
];

// ===== 完整组装 =====
export const ALL_FIXED_PHRASES: FixedPhrase[] = [
  ...SYSTEM_STATUS,
  ...SYSTEM_OPERATION,
  ...SERVO_GENERAL,
  ...SERVO_ALARM,
  ...MOTOR_GENERAL,
  ...CYLINDER_GENERAL,
  ...GENERAL_OPERATION,
  ...DEVICE_PARTS,
  ...HMI_PAGE_LABELS,
];

// Build exact-match map
export const FIXED_PHRASE_MAP = new Map<string, string>();
for (const [zh, en] of ALL_FIXED_PHRASES) {
  FIXED_PHRASE_MAP.set(zh, en);
}
