App({
  onLaunch: function() {
    console.log('App Launch')
  },
  getToken: function() {
    return wx.getStorageSync("token");
  },
  getSupplierToken: function() {
    return wx.getStorageSync("supplierToken");
  },
  onShow: function() {
    //获得openid,token
    var that = this;
    wx.login({
      success: function(res) {
        var js_code = res.code;
        wx.request({
          url: that.globalData.backendUrl + "getOpenId",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            "jsCode": js_code
          },
          method: 'POST',
          success: function(res) {
            //获得从后端获取认证信息
            if (res.statusCode == 200) {
              var openId = res.data.openId;
              var sessionKey = res.data.sessionKey;
              wx.setStorageSync("sessionKey", sessionKey);
              wx.request({
                url: that.globalData.backendUrl + "account/login",
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  username: openId,
                  password: "user"
                },
                method: 'GET',
                success: (res) => {
                  wx.setStorageSync("token", res.data.token);
                }
              })
            }
          }
        })
      }
    })
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  globalData: {
    hasLogin: false,
    token: "",
     //backendUrl: "http://localhost:8080/",
    backendUrl: "https://www.sandc.xyz/",
  }
});