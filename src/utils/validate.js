/**
 * Created by PanJiaChen on 16/11/18.
 */

import fa from "element-ui/src/locale/lang/fa";

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 校验用户名
 * 字符最少1个
 * 不允许有特殊字符（包括空格）
 * 不允许中文
 */
export function validUsername(str) {
  if (str.length<1 || str.length>16) return false
  for(var i=0;i<str.length;i++) {
    if(!/^[a-zA-Z0-9]$/.test(str[i])) {
      return false
    }
  }
  return true;
}

/**
 * 校验安全码
 * 去掉空格后字符长度不小于6
 */
export function validateVcode(str) {
  return str.replace(/\s/g,"").length<6 ? false : true
}
