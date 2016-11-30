const electron = require('electron');

module.exports = {
  'cookie' : {
    'domain' : ".samsung.com",
    'name' : "IW_AUTHENTICATION.P4",
    'url' : "http://wcms4.samsung.com"
  },
  'cookieLogin' : {
    'domain' : ".samsung.com",
    'name' : "IWSEC_SESSION",
    'url' : "http://wcms4.samsung.com"
  },
  "wdsLogin":{
    "url":"https://wds.samsung.com/wds/sso/login/forwardLogin.do",
    "width":500,
    "height":300
  },
  "WCMS":{
    "url":"https://wcms4.samsung.com/iw-sec/wmcLoginSSL.do"
  }
  //   "temp":"https://wds.samsung.com/wds/sso/login/forwardLoginForm.do"
  // https://wcms4.samsung.com/iw-sec/wmcLoginSSL.do
  // http://wcms4.samsung.com/iw-cc/ccpro
};
