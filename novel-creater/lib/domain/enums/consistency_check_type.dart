/// Six types of consistency checks as specified in AGENTS.md.
enum ConsistencyCheckType {
  characterBehavior, // 角色行为矛盾
  appearanceConflict, // 外貌描述冲突
  timelineConflict, // 时间线矛盾
  settingViolation, // 设定规则违反
  relationshipLogic, // 关系逻辑冲突
  namingInconsistency, // 名称/称呼不一致
}
