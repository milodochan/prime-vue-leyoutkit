/**
 * 筛选类型枚举
 */
export const FilterOperatorEnum = {
  EQUAL: "=",              // 等于
  NOT_EQUAL: "!=",         // 不等于
  GREATER: ">",            // 大于
  LESS: "<",               // 小于
  GREATER_EQUAL: ">=",     // 大于等于
  LESS_EQUAL: "<=",        // 小于等于
  IS_NULL: "isNull",       // IS NULL
  IS_NOT_NULL: "isNotNull",// IS NOT NULL
  LIKE: "like",            // LIKE
  NOT_LIKE: "notLike",     // NOT LIKE
  IN: "in",                // IN
  NOT_IN: "notIn",         // NOT IN
  OR: "or",                // OR
}